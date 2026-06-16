import re

html_sections = '''
                            <!-- DYNAMIC FIELDS PER SERVICE -->
                            <div id="dynamic-fields-container" style="display: none; margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--border-glow);">
                                <h4 id="dynamic-fields-title" style="margin-bottom: 16px; display: flex; align-items: center; gap: 8px; color: var(--primary);">
                                    <i data-lucide="info"></i> <span>Informações Específicas</span>
                                </h4>

                                <!-- ADESTRAMENTO -->
                                <div id="fields-adestramento" class="service-fields" style="display: none;">
                                    <div class="form-row" style="grid-template-columns: 1fr 1fr;">
                                        <div class="form-group">
                                            <label for="adest-obediencia">Nível de Obediência Atual</label>
                                            <select id="adest-obediencia">
                                                <option value="">Selecione</option>
                                                <option value="Nenhum">Nenhum</option>
                                                <option value="Básico">Básico</option>
                                                <option value="Avançado">Avançado</option>
                                            </select>
                                        </div>
                                        <div class="form-group">
                                            <label>Problema de Comportamento?</label>
                                            <div class="custom-radio-group" style="height: auto; padding: 8px 12px; flex-wrap: wrap; gap: 12px; justify-content: flex-start;">
                                                <label class="custom-radio-check"><input type="checkbox" name="adest-problema" value="Agressividade"><div class="radio-box box-success"><i data-lucide="check"></i></div><span class="radio-label">Agressividade</span></label>
                                                <label class="custom-radio-check"><input type="checkbox" name="adest-problema" value="Puxa Guia"><div class="radio-box box-success"><i data-lucide="check"></i></div><span class="radio-label">Puxa Guia</span></label>
                                                <label class="custom-radio-check"><input type="checkbox" name="adest-problema" value="Destrói Coisas"><div class="radio-box box-success"><i data-lucide="check"></i></div><span class="radio-label">Destrói Coisas</span></label>
                                                <label class="custom-radio-check"><input type="checkbox" name="adest-problema" value="Xixi Fora"><div class="radio-box box-success"><i data-lucide="check"></i></div><span class="radio-label">Xixi Fora</span></label>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="form-row" style="grid-template-columns: 1fr; margin-top: 16px;">
                                        <div class="form-group">
                                            <label for="adest-objetivo">Objetivo Principal do Adestramento</label>
                                            <textarea id="adest-objetivo" style="background-color: var(--bg-card); border: 1px solid var(--border-glow); border-radius: 8px; color: var(--text-main); font-family: inherit; font-size: 14px; padding: 10px 14px; resize: vertical; min-height: 80px; width: 100%;" placeholder="O que você espera alcançar com o adestramento?"></textarea>
                                        </div>
                                    </div>
                                </div>

                                <!-- HOSPEDAGEM -->
                                <div id="fields-hospedagem" class="service-fields" style="display: none;">
                                    <div class="form-row" style="grid-template-columns: 1fr 1fr;">
                                        <div class="form-group">
                                            <label for="hosp-sociavel">Sociável com outros pets?</label>
                                            <select id="hosp-sociavel">
                                                <option value="">Selecione</option>
                                                <option value="Sim">Sim</option>
                                                <option value="Não">Não</option>
                                                <option value="Depende">Depende</option>
                                            </select>
                                        </div>
                                        <div class="form-group">
                                            <label>Autoriza interação em matilha?</label>
                                            <div class="custom-radio-group">
                                                <label class="custom-radio-check"><input type="radio" name="hosp-matilha" value="Sim"><div class="radio-box box-success"><i data-lucide="check"></i></div><span class="radio-label">Sim</span></label>
                                                <label class="custom-radio-check"><input type="radio" name="hosp-matilha" value="Não"><div class="radio-box box-danger"><i data-lucide="x"></i></div><span class="radio-label">Não</span></label>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="form-row" style="grid-template-columns: 1fr; margin-top: 16px;">
                                        <div class="form-group">
                                            <label for="hosp-noturno">Comportamento Noturno</label>
                                            <textarea id="hosp-noturno" style="background-color: var(--bg-card); border: 1px solid var(--border-glow); border-radius: 8px; color: var(--text-main); font-family: inherit; font-size: 14px; padding: 10px 14px; resize: vertical; min-height: 80px; width: 100%;" placeholder="Como ele costuma dormir? Chora à noite? Onde dorme normalmente?"></textarea>
                                        </div>
                                    </div>
                                </div>

                                <!-- PASSEIOS -->
                                <div id="fields-passeios" class="service-fields" style="display: none;">
                                    <div class="form-row" style="grid-template-columns: 1fr 1fr;">
                                        <div class="form-group">
                                            <label for="pass-energia">Nível de Energia</label>
                                            <select id="pass-energia">
                                                <option value="">Selecione</option>
                                                <option value="Baixa">Baixa</option>
                                                <option value="Média">Média</option>
                                                <option value="Alta">Alta</option>
                                            </select>
                                        </div>
                                        <div class="form-group">
                                            <label for="pass-coleira">Tipo de Coleira que utiliza</label>
                                            <select id="pass-coleira">
                                                <option value="">Selecione</option>
                                                <option value="Peitoral">Peitoral</option>
                                                <option value="Pescoço">Coleira de Pescoço</option>
                                                <option value="Enforcador">Enforcador / Unificada</option>
                                                <option value="Cabresto">Cabresto (Gentle Leader)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="form-row" style="grid-template-columns: 1fr; margin-top: 16px;">
                                        <div class="form-group">
                                            <label for="pass-reatividade">Reatividade na rua</label>
                                            <textarea id="pass-reatividade" style="background-color: var(--bg-card); border: 1px solid var(--border-glow); border-radius: 8px; color: var(--text-main); font-family: inherit; font-size: 14px; padding: 10px 14px; resize: vertical; min-height: 80px; width: 100%;" placeholder="Como reage a outros cães, gatos, motos, caminhões, ou pessoas estranhas?"></textarea>
                                        </div>
                                    </div>
                                </div>

                                <!-- CUIDADO DOMICILIAR -->
                                <div id="fields-cuidado" class="service-fields" style="display: none;">
                                    <div class="form-row" style="grid-template-columns: 1fr 1fr;">
                                        <div class="form-group">
                                            <label for="cuid-acesso">Acesso na Residência</label>
                                            <textarea id="cuid-acesso" style="background-color: var(--bg-card); border: 1px solid var(--border-glow); border-radius: 8px; color: var(--text-main); font-family: inherit; font-size: 14px; padding: 10px 14px; resize: vertical; min-height: 80px; width: 100%;" placeholder="Por onde o pet pode circular? Algum cômodo proibido?"></textarea>
                                        </div>
                                        <div class="form-group">
                                            <label for="cuid-itens">Localização dos Itens</label>
                                            <textarea id="cuid-itens" style="background-color: var(--bg-card); border: 1px solid var(--border-glow); border-radius: 8px; color: var(--text-main); font-family: inherit; font-size: 14px; padding: 10px 14px; resize: vertical; min-height: 80px; width: 100%;" placeholder="Onde ficam ração, petiscos, tapetes higiênicos, guias, sacos de lixo?"></textarea>
                                        </div>
                                    </div>
                                    <div class="form-row" style="grid-template-columns: 1fr; margin-top: 16px;">
                                        <div class="form-group">
                                            <label for="cuid-seguranca">Alarme / Segurança da Casa</label>
                                            <textarea id="cuid-seguranca" style="background-color: var(--bg-card); border: 1px solid var(--border-glow); border-radius: 8px; color: var(--text-main); font-family: inherit; font-size: 14px; padding: 10px 14px; resize: vertical; min-height: 80px; width: 100%;" placeholder="Instruções sobre alarme, trancas, câmeras ou portaria..."></textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>
'''

with open('public/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Insert before modal-footer
pattern = r'(<div class="modal-footer" style="margin-top: 32px; padding-top: 16px; border-top: 1px solid var\(--border-glow\);">)'

html = re.sub(pattern, html_sections + '\n\\1', html)

with open('public/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("HTML modified")
