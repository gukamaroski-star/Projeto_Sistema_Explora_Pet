html_injection = '''                            <!-- ROW SERVIÇOS -->
                            <div class="form-row" style="grid-template-columns: 1fr; margin-top: 16px; margin-bottom: 24px;">
                                <div class="form-group">
                                    <label>Serviços de Interesse (Selecione os aplicáveis)</label>
                                    <div class="custom-radio-group" style="height: auto; padding: 16px; flex-wrap: wrap; gap: 24px; justify-content: flex-start;">
                                        <label class="custom-radio-check">
                                            <input type="checkbox" name="pet-servicos" value="Adestramento">
                                            <div class="radio-box box-success"><i data-lucide="check"></i></div>
                                            <span class="radio-label">Adestramento</span>
                                        </label>
                                        <label class="custom-radio-check">
                                            <input type="checkbox" name="pet-servicos" value="Cuidado Domiciliar">
                                            <div class="radio-box box-success"><i data-lucide="check"></i></div>
                                            <span class="radio-label">Cuidado Domiciliar</span>
                                        </label>
                                        <label class="custom-radio-check">
                                            <input type="checkbox" name="pet-servicos" value="Hospedagem">
                                            <div class="radio-box box-success"><i data-lucide="check"></i></div>
                                            <span class="radio-label">Hospedagem</span>
                                        </label>
                                        <label class="custom-radio-check">
                                            <input type="checkbox" name="pet-servicos" value="Passeios">
                                            <div class="radio-box box-success"><i data-lucide="check"></i></div>
                                            <span class="radio-label">Passeios</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
'''

with open('public/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

if '<!-- ROW 5 -->' in html:
    html = html.replace('<!-- ROW 5 -->', html_injection + '\n                            <!-- ROW 5 -->')
    with open('public/index.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print('HTML modified.')
else:
    print('ROW 5 não encontrado')
