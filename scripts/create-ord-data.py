"""Transcribe ORD (CVPR 2026) tables, visually checked against the supplied PDF.

All text files use UTF-8. This script only regenerates ORD's experiment data.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PDF = 'https://openaccess.thecvf.com/content/CVPR2026/papers/Huang_ORD_Object-Relation_Decoupling_for_Generalized_3D_Visual_Grounding_CVPR_2026_paper.pdf'
SPLITS = ['Overall', 'Easy', 'Hard', 'View Dep.', 'View Indep.']

# Column order follows the printed tables, including the Sr3D Overall of 76.2.
sr3d = {
    'CoT3DRef': [73.2, 75.2, 67.9, 67.6, 73.5],
    'MiKASA': [75.2, 78.6, 67.3, 70.4, 75.4],
    'ViewSRD': [76.0, 78.3, 70.6, 69.0, 76.2],
    'ORD': [76.2, 78.4, 71.0, 64.2, 76.8],
}
nr3d = {
    'CoT3DRef': [64.4, 70.0, 59.2, 61.9, 65.7],
    'MiKASA': [64.4, 69.7, 59.4, 65.4, 64.0],
    'ViewSRD': [69.9, 75.3, 64.8, 68.6, 70.6],
    'ORD': [71.6, 76.4, 67.0, 69.8, 72.5],
}
dependent = {
    'MVT': [56.5, 56.2, 51.7, 42.1],
    'MiKASA': [62.1, 63.4, 65.2, 56.3],
    'CoT3DRef': [61.3, 64.4, 65.0, 57.9],
    'ViewSRD': [70.2, 68.1, 68.5, 63.3],
    'ORD': [71.5, 70.6, 71.7, 70.5],
}
independent = {
    'MVT': [55.8, 47.2, 65.3, 70.0, 54.6],
    'MiKASA': [62.6, 57.0, 67.3, 76.8, 62.8],
    'CoT3DRef': [64.2, 56.3, 66.9, 77.7, 63.2],
    'ViewSRD': [71.6, 64.6, 71.4, 80.4, 75.2],
    'ORD': [73.4, 59.7, 74.7, 70.5, 83.0],
}
ranking = {
    'MVT': [0.55, 5.76, 2.45],
    'CoT3DRef': [0.65, 4.29, 1.96],
    'ViewSRD': [0.69, 3.11, 1.08],
    'ORD': [0.81, 1.85, 1.01],
}
ablation = {
    'w/o Anchors & ROR': [62.2, 68.5, 56.1, 60.1, 63.2],
    'w/o SFAM (G & P)': [69.1, 74.0, 64.3, 69.1, 69.1],
    'w/o SFAM G': [69.8, 75.9, 64.0, 68.0, 71.4],
    'w/o SFAM P': [70.8, 76.7, 65.1, 69.5, 70.7],
    'w/o SIEM & AIEM': [70.9, 76.9, 65.1, 70.4, 71.2],
    'w/o AGRM': [71.0, 75.5, 65.0, 67.0, 70.6],
    'ORD': [71.6, 76.4, 67.0, 69.8, 72.5],
}
# Object and sentence losses remain enabled in all six rows of Table 8.
losses = [
    {'ref': False, 'r': False, 'sym': False, 'f2r': False, 't2r': False, 'overall': 62.2},
    {'ref': True, 'r': False, 'sym': False, 'f2r': False, 't2r': False, 'overall': 64.3},
    {'ref': True, 'r': True, 'sym': False, 'f2r': False, 't2r': False, 'overall': 70.4},
    {'ref': True, 'r': False, 'sym': True, 'f2r': False, 't2r': False, 'overall': 70.1},
    {'ref': True, 'r': True, 'sym': True, 'f2r': True, 't2r': False, 'overall': 71.1},
    {'ref': True, 'r': True, 'sym': True, 'f2r': False, 't2r': True, 'overall': 71.3},
]


def chart(key, title, table, categories, series, *, kind='comparison', x_label='评估子集'):
    return {
        'id': f'ord-{key}', 'title': title, 'kind': kind, 'chart': 'bar',
        'metric': 'Grounding accuracy', 'unit': '%', 'valueFormat': 'percent',
        'decimals': 1, 'xLabel': x_label, 'categories': categories,
        'series': [{'name': name, 'values': values} for name, values in series],
        'source': {
            'label': f'ORD · {table}', 'url': PDF,
            'note': '按原论文表格转录，单位为 %；方法顺序与图例一致。',
        },
    }


charts = {
    'nr3d': chart('nr3d', 'Nr3D：整体与分组定位性能', '表 3（PDF 第 7 页）', SPLITS, nr3d.items()),
    'sr3d': chart('sr3d', 'Sr3D：模板化关系描述下的定位性能', '表 2（PDF 第 7 页）', SPLITS, sr3d.items()),
    'dependent': chart('dependent', '视角依赖关系：左、右、前、后', '表 4（PDF 第 7 页）',
                       ['Left', 'Right', 'Front', 'Behind'],
                       [(n, dependent[n]) for n in ['CoT3DRef', 'ViewSRD', 'ORD']], x_label='空间谓词'),
    'independent': chart('independent', '视角无关关系：距离、夹持与上下关系', '表 5（PDF 第 7 页）',
                         ['Closest', 'Farthest', 'Between', 'Above', 'Under'],
                         [(n, independent[n]) for n in ['CoT3DRef', 'ViewSRD', 'ORD']], x_label='空间谓词'),
    'ablation': chart('ablation', 'Nr3D：组件消融与困难子集表现', '表 7（PDF 第 8 页）',
                      list(ablation), [(SPLITS[i], [v[i] for v in ablation.values()]) for i in [0, 2, 3]],
                      kind='ablation', x_label='模型配置'),
}
charts['sr3d']['source']['note'] = '按表 2 列序转录：ORD Overall 为 76.2%，View Indep. 为 76.8%。'
data = {
    'paper': {
        'title': 'ORD: Object-Relation Decoupling for Generalized 3D Visual Grounding',
        'conference': 'CVPR 2026', 'pages': '30964–30973', 'url': PDF,
        'provenance': 'Transcribed and visually checked against the supplied paper; reported results, not a training reproduction.',
    },
    'tables': {'table2': sr3d, 'table3': nr3d, 'table4': dependent, 'table5': independent,
               'table6': ranking, 'table7': ablation, 'table8': losses},
    'charts': charts,
}
(ROOT / 'src/data/experiments/ord.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('Wrote src/data/experiments/ord.json from ORD tables 2–8')
