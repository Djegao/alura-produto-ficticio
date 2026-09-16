# -*- coding: utf-8 -*-
"""
Lê docs/aula2-script.md (Slide · Script) + docs/aula2-bases.md (slide → base)
e escreve um JSON com a especificação de cada slide, pronto pro gerar-aula2.ps1.

    python parse-script.py ../../docs/aula2-script.md ../../docs/aula2-bases.md aula2-spec.json

O script .md é a única fonte de conteúdo. Editou o script? Rode de novo.
"""
import io, json, re, sys

ORCAMENTO = {  # base -> {campo: max chars}
    'A1·22': {'title': 33},
    'A1·5':  {'title': 20, 'sub': 25},
    'A1·10': {'title': 45},
    'A1·16': {'title': 20, 'sub': 38, 'b0': 36, 'b1': 57, 'b2': 40},
    'A1·27': {'title': 32, 'b0': 62, 'b1': 93, 'b2': 108},
    'A1·21': {'title': 24, 'sub': 65},
}

def parse_bases(path):
    """{'2.1': {4: 'A1·16', 5: 'A1·16', ...}}"""
    mapa, video = {}, None
    for line in io.open(path, encoding='utf-8'):
        m = re.match(r'^### (\d\.\d)', line)
        if m:
            video = m.group(1); mapa[video] = {}; continue
        if not video or not line.startswith('|'):
            continue
        cells = [c.strip() for c in line.strip().strip('|').split('|')]
        if len(cells) < 2 or not re.match(r'^\d', cells[0]):
            continue
        rng = re.split(r'[–-]', cells[0])
        nums = list(range(int(rng[0]), int(rng[-1]) + 1))
        mb = re.search(r'(A[12]·\d+)', cells[1])
        if 'tabela' in cells[1].lower():
            base = 'tabela'          # "tabela nova — sugestão: fundo do A1·10" continua sendo tabela
        else:
            base = mb.group(1) if mb else '?'
        for n in nums:
            mapa[video][n] = base
    return mapa

def parse_script(path):
    slides, video, cur, mode = [], None, None, None
    for raw in io.open(path, encoding='utf-8'):
        line = raw.rstrip('\n')
        m = re.match(r'^# (\d\.\d) ', line)
        if m:
            video = m.group(1); cur = None; mode = None; continue
        m = re.match(r'^## Slides? ([\d, e]+)\s*\((.*)\)', line)
        if m and video:
            nums = [int(x) for x in re.findall(r'\d+', m.group(1))]
            cur = {'video': video, 'nums': nums, 'kind': m.group(2), 'title': None, 'sub': [],
                   'bullets': [], 'table': [], 'notes': [], 'action': [], 'code': []}
            slides.append(cur); mode = 'tela'; continue
        if cur is None:
            continue
        if line.strip() == '**Script**':
            mode = 'script'; continue
        if line.startswith('---'):
            cur = None; mode = None; continue
        if mode == 'tela':
            s = line.strip()
            if not s:
                continue
            if s.startswith('```'):
                mode = 'code'; continue
            if s.startswith('🔴'):
                cur['action'].append(s.lstrip('🔴 ').strip()); continue
            if s.startswith('|'):
                cells = [c.strip() for c in s.strip('|').split('|')]
                if not all(re.match(r'^-+$', c) for c in cells):
                    cur['table'].append(cells)
                continue
            if s.startswith('- '):
                cur['bullets'].append(s[2:].strip()); continue
            mb = re.match(r'^\*\*(.+)\*\*$', s)
            if mb and cur['title'] is None:
                cur['title'] = mb.group(1); continue
            # texto de apoio depois do comando/ação (ex.: "~15 s. ...") vai pra nota
            if cur['code'] or cur['action']:
                cur['action'].append(s); continue
            cur['sub'].append(s)
        elif mode == 'code':
            if line.strip().startswith('```'):
                mode = 'tela'
            else:
                cur['code'].append(line)
        elif mode == 'script':
            cur['notes'].append(line)
    return slides

def limpar_md(t):
    t = re.sub(r'\*\*(.+?)\*\*', r'\1', t)
    t = re.sub(r'\*(.+?)\*', r'\1', t)
    t = re.sub(r'`(.+?)`', r'\1', t)
    return t

def main(script_md, bases_md, out_json):
    bases = parse_bases(bases_md)
    slides = parse_script(script_md)
    spec, avisos = [], []
    for s in slides:
        nums = s['nums']
        base = bases.get(s['video'], {}).get(nums[0], '?')
        notes = '\n'.join(s['notes']).strip()
        notes = re.sub(r'\n{3,}', '\n\n', notes)
        extra = []
        if s['action']:
            extra.append('AÇÃO: ' + ' '.join(s['action']))
        if s['code']:
            extra.append('COMANDO:\n' + '\n'.join(s['code']))
        if extra:
            notes = '\n\n'.join(extra) + ('\n\n' + notes if notes else '')
        notes = limpar_md(notes)
        title = limpar_md(s['title'] or '')
        sub = limpar_md(' '.join(s['sub']))
        bullets = [limpar_md(b) for b in s['bullets']]
        table = [[limpar_md(c) for c in row] for row in s['table']]
        is_build = len(nums) > 1 and 'build' in s['kind'].lower()
        for i, n in enumerate(nums):
            item = {'video': s['video'], 'n': n, 'base': base, 'kind': s['kind'],
                    'title': title, 'sub': sub, 'table': table, 'notes': notes,
                    'bullets': bullets[:i + 1] if is_build else bullets}
            if base == 'tabela':
                item['base'] = 'A1·10'; item['tabela'] = True
            spec.append(item)
            orc = ORCAMENTO.get(item['base'], {})
            for campo, mx in orc.items():
                val = None
                if campo == 'title': val = title
                elif campo == 'sub': val = sub
                elif campo.startswith('b'):
                    k = int(campo[1:]); val = item['bullets'][k] if k < len(item['bullets']) else None
                if val and len(val) > mx:
                    avisos.append(f"{s['video']} slide {n} ({item['base']}) {campo}: {len(val)} > {mx}  «{val[:50]}…»")
    with io.open(out_json, 'w', encoding='utf-8') as f:
        json.dump(spec, f, ensure_ascii=False, indent=1)
    por_video = {}
    for it in spec:
        por_video[it['video']] = por_video.get(it['video'], 0) + 1
    print('slides:', len(spec), por_video)
    for it in spec:
        print(f"  {it['video']} #{it['n']:>2} {it['base']:<7} {it['title'][:48]!r}"
              f"{'  [tabela]' if it.get('tabela') else ''}{'  bullets=' + str(len(it['bullets'])) if it['bullets'] else ''}")
    if avisos:
        print('\nAVISOS de orçamento de caracteres (o Diego ajusta no Google Slides):')
        for a in avisos: print('  -', a)

if __name__ == '__main__':
    main(*sys.argv[1:4])
