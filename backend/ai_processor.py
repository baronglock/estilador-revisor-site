# Substitua todo o conteúdo de backend/ai_processor.py por este código:

import time
import requests
from typing import List, Dict
from concurrent.futures import ThreadPoolExecutor, as_completed
from backend.config import Config

class AIProcessor:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.model = Config.GPT_MODEL
        self.api_url = "https://api.openai.com/v1/chat/completions"
        self.styles = []
        self.removal_prompts = []
        self.total_prompt_tokens = 0
        self.total_completion_tokens = 0
        print(f"AIProcessor inicializado com modelo: {self.model} (Modo Concorrente Otimizado)")

    # Em backend/ai_processor.py

    def _get_style_for_single_paragraph(self, para_data: Dict, all_paragraphs: List[Dict]) -> tuple:
        """
        Pede à IA o estilo para um único parágrafo e retorna uma tupla:
        (paragrafo_atualizado, prompt_tokens, completion_tokens)
        """
        i = para_data['index']
        total_paragraphs = len(all_paragraphs)

        prev_text = all_paragraphs[i-1]['text'] if i > 0 else "INÍCIO DO DOCUMENTO"
        current_text = para_data['text']
        next_text = all_paragraphs[i+1]['text'] if i < total_paragraphs - 1 else "FIM DO DOCUMENTO"
        
        # A linha abaixo é a que faltava para passar as "dicas" para o prompt
        user_prompt = self._build_user_prompt(prev_text, current_text, next_text, para_data)
        system_prompt = self._build_system_prompt()

        headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
        data = {
            "model": self.model,
            "messages": [{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
            "temperature": 0.05,
            "max_tokens": 50
        }

        prompt_tokens, completion_tokens = 0, 0
        marker = "[[NONE]]"

        try:
            response = requests.post(self.api_url, headers=headers, json=data, timeout=45)
            if response.status_code == 200:
                result = response.json()
                if 'usage' in result:
                    # Captura os tokens desta chamada específica
                    prompt_tokens = result['usage'].get('prompt_tokens', 0)
                    completion_tokens = result['usage'].get('completion_tokens', 0)

                api_marker = result['choices'][0]['message']['content'].strip()
                all_valid_markers = [s['marker'] for s in self.styles] + [r['startMarker'] for r in self.removal_prompts] + [r['endMarker'] for r in self.removal_prompts]
                
                if api_marker in all_valid_markers:
                    marker = api_marker
        except requests.exceptions.RequestException:
            pass 

        para_data['markers'] = [marker] if marker != "[[NONE]]" else []
        # Retorna os 3 valores
        return para_data, prompt_tokens, completion_tokens

    def process_document(self, paragraphs: List[Dict], styles: List[Dict], removal_prompts: List[Dict]) -> Dict:
        """Processa o documento de forma concorrente para máxima velocidade e precisão."""
        self.styles = styles
        self.removal_prompts = removal_prompts
        self.total_prompt_tokens = 0
        self.total_completion_tokens = 0

        marked_content = [None] * len(paragraphs)
        total_paragraphs = len(paragraphs)
        
        # Define o número de trabalhadores (requisições simultâneas)
        # Um bom ponto de partida é entre 10 e 20.
        MAX_WORKERS = 20

        print(f"Iniciando processamento concorrente de {total_paragraphs} parágrafos com até {MAX_WORKERS} workers...")

        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            future_to_para = {executor.submit(self._get_style_for_single_paragraph, para, paragraphs): para['index'] for para in paragraphs}
            
            processed_count = 0
            for future in as_completed(future_to_para):
                original_index = future_to_para[future]
                try:
                    # Coleta os 3 valores retornados
                    result_para, p_tokens, c_tokens = future.result()
                    self.total_prompt_tokens += p_tokens
                    self.total_completion_tokens += c_tokens
                    marked_content[original_index] = result_para
                except Exception as exc:
                    print(f'Parágrafo {original_index} gerou uma exceção: {exc}')
                    marked_content[original_index] = next(p for p in paragraphs if p['index'] == original_index)

                processed_count += 1
                if processed_count % 50 == 0 or processed_count == total_paragraphs:
                    print(f"  Processados {processed_count}/{total_paragraphs} parágrafos...")
        
        # Adiciona uma pequena pausa para não sobrecarregar a API entre diferentes execuções
        time.sleep(1)

        marked_count = sum(1 for p in marked_content if p and p.get('markers'))
        total_cost = self._calculate_cost()
        stats = {
            'total_paragraphs': total_paragraphs,
            'marked': marked_count,
            'unmarked': total_paragraphs - marked_count,
            'api_calls': total_paragraphs,
            'estimated_cost_usd': total_cost
        }

        return {'marked_content': marked_content, 'stats': stats}

    def _calculate_cost(self) -> float:
        input_cost = (self.total_prompt_tokens / 1_000_000) * Config.GPT4_1_INPUT_PRICE_PER_MILLION_TOKENS
        output_cost = (self.total_completion_tokens / 1_000_000) * Config.GPT4_1_OUTPUT_PRICE_PER_MILLION_TOKENS
        return input_cost + output_cost

    def _build_system_prompt(self) -> str:
        """Constrói o prompt do sistema com as definições de estilos."""
        prompt = """Você é um assistente de IA especialista em formatação de documentos. Sua única tarefa é classificar um parágrafo.
REGRAS RÍGIDAS:
1. Sua resposta deve ser APENAS e EXCLUSIVAMENTE o marcador de estilo (ex: `[[ENUNCIADO]]`).
2. NÃO inclua explicações ou qualquer outro texto.
3. Se o parágrafo for APENAS uma imagem, use o estilo de imagem.
4. **REGRA CRÍTICA:** Se um parágrafo começar com uma letra de alternativa (ex: "A)", "b)") E contiver uma imagem, ele AINDA É uma `[[ALTERNATIVA]]`. A alternativa tem prioridade.
5. **REGRA CRÍTICA:** Se um parágrafo for um item de LISTA (bullet ou numerada), aplique o estilo de conteúdo geral (como `[[TEXTO BOX]]`), a menos que o conteúdo claramente se encaixe em outro estilo (como `[[ALTERNATIVA]]` ou `[[GABARITO]]`).
6. Use o contexto para decidir. Se o parágrafo ATUAL for "Estudos 1 a 10" e o ANTERIOR for "Simulado 1", o ATUAL é um subtítulo.
7. Se nenhum estilo se aplicar, responda com `[[NONE]]`.

ESTILOS DISPONÍVEIS:
"""
        for style in self.styles:
            prompt += f"- `{style['marker']}`: {style['prompt']}\n"
        for removal in self.removal_prompts:
            prompt += f"- `{removal['startMarker']}`: {removal['prompt']} (apenas início da seção)\n"
            prompt += f"- `{removal['endMarker']}`: {removal['prompt']} (apenas fim da seção)\n"
        return prompt

    def _build_user_prompt(self, prev_text: str, current_text: str, next_text: str, para_data: Dict) -> str:
        """Constrói o prompt do usuário com contexto e informações do parágrafo"""
        prompt = f'CONTEXTO ANTERIOR: """{prev_text[:500]}"""\n'
        prompt += f'PARÁGRAFO ATUAL PARA CLASSIFICAR: """{current_text}"""\n'
        
        # Verifica se é um parágrafo de imagem
        is_image_para = para_data.get('is_image_paragraph', False)
        if is_image_para:
            prompt += "(AVISO: Este parágrafo contém apenas uma imagem e nenhum texto.)\n"
            
        # Adiciona informações sobre listas se relevante
        if para_data.get('is_list_item'):
            list_type = para_data.get('list_type', 'unknown')
            prompt += f"(AVISO: Este é um item de lista do tipo: {list_type})\n"
            
        prompt += f'CONTEXTO POSTERIOR: """{next_text[:500]}"""\n\n'
        prompt += "Qual é o marcador para o PARÁGRAFO ATUAL?"
        return prompt