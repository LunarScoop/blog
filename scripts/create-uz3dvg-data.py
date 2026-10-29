"""Transcribe UZ3DVG tables 1–4 and figure 3 from the supplied CVPR 2026 PDF.

All text files use UTF-8. Values are checked against rendered paper pages.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PDF = 'https://openaccess.thecvf.com/content/CVPR2026/papers/Tan_UZ3DVG_Unaided_Zero-Shot_3D_Visual_Grounding_with_Generated_Language_Conditions_CVPR_2026_paper.pdf'
SPLITS = ['Unique', 'Multiple', 'Overall']

# ScanRefer rows: Unique@.25/.5, Multiple@.25/.5, Overall@.25/.5, FPS.
mask3d = {
    'ZSVG3D': [63.80, 58.40, 27.70, 24.60, 36.40, 32.70, 0.14],
    'SeeGround': [75.70, 68.90, 34.00, 30.00, 44.10, 39.40, 0.20],
    'UZ3DVG': [73.57, 68.15, 40.49, 36.33, 45.42, 41.08, 7.69],
}
non_mask3d = {
    'ZSVG3D': [32.50, 27.80, 16.10, 14.60, 20.00, 17.60, 0.21],
    'UZ3DVG': [69.62, 56.94, 38.48, 31.21, 43.13, 35.05, 9.43],
}
# Nr3D rows: Easy, Hard, View Dep., View Indep., Overall.
nr3d = {
    'ZSVG3D': [46.5, 31.7, 36.8, 40.0, 39.0],
    'SeeGround': [54.5, 38.3, 42.3, 48.2, 46.1],
    'UZ3DVG': [52.2, 40.8, 39.3, 50.1, 46.5],
}
ablation = {
    'Baseline': [40.75, 37.18],
    '+ TSVDE': [41.83, 38.21],
    '+ TSVDE + RCD': [43.26, 39.65],
    '+ TSVDE + GeoSM': [43.15, 39.47],
    'UZ3DVG': [45.42, 41.08],
}
annotation = {
    '2D Info': [34.16, 22.83],
    'MSAG-RC w/o RC': [43.15, 39.47],
    'MSAG-RC': [45.42, 41.08],
}
vlms = {
    'Qwen3-VL-Plus': [43.87, 39.62],
    'Doubao-seed-1.6': [45.42, 41.08],
}
scale = {
    '10K': [25.71, 21.14],
    '20K': [36.88, 30.65],
    '30K': [43.36, 39.52],
    '40K': [45.42, 41.08],
}


def chart(key, title, table, categories, series, *, kind='comparison',
          x_label='评估子集', decimals=2, chart_type='bar', note=None):
    return {
        'id': f'uz3dvg-{key}', 'title': title, 'kind': kind, 'chart': chart_type,
        'metric': 'Grounding accuracy', 'unit': '%', 'valueFormat': 'percent',
        'decimals': decimals, 'xLabel': x_label, 'categories': list(categories),
        'series': [{'name': name, 'values': values} for name, values in series],
        'source': {
            'label': f'UZ3DVG · {table}', 'url': PDF,
            'note': note or '按原论文转录；数值为准确率（%），文中增益以百分点表示。',
        },
    }


def threshold_series(table):
    return [(f'Acc@{threshold}', [row[i] for row in table.values()])
            for i, threshold in enumerate(['0.25', '0.5'])]


charts = {
    'scanrefer': chart('scanrefer', 'ScanRefer：Mask3D 配置下的 Acc@0.5',
        '表 1（PDF 第 6 页）', SPLITS,
        [(name, [row[i] for i in [1, 3, 5]]) for name, row in mask3d.items()],
        note='Mask3D-Based 三组结果；UZ3DVG 使用 Mask3D 进行预测后的边界框细化。'),
    'nonMask3d': chart('non-mask3d', 'ScanRefer：无 Mask3D 的定位准确率',
        '表 1（PDF 第 6 页）', ['Overall Acc@0.25', 'Overall Acc@0.5'],
        [(name, row[4:6]) for name, row in non_mask3d.items()],
        x_label='评价指标', note='Non-Mask3D 配置；ZSVG3D 为 0.21 FPS，UZ3DVG 为 9.43 FPS。'),
    'nr3d': chart('nr3d', 'Nr3D：跨数据集直接推理的定位性能',
        '表 2（PDF 第 7 页）', ['Easy', 'Hard', 'View Dep.', 'View Indep.', 'Overall'],
        nr3d.items(), decimals=1,
        note='UZ3DVG 沿用 ScanRefer 伪标注训练的检查点，无 Nr3D 微调，采用 Mask3D 细化；图中三种方法均为完整验证集结果。'),
    'ablation': chart('ablation', 'ScanRefer：语义采样、推理蒸馏与几何建模',
        '表 3（PDF 第 7 页）', ablation, threshold_series(ablation),
        kind='ablation', x_label='模型配置'),
    'annotation': chart('annotation', 'ScanRefer：空间伪标注与推理链的作用',
        '表 4（PDF 第 8 页）', annotation, threshold_series(annotation),
        kind='ablation', x_label='标注生成配置'),
    'vlms': chart('vlms', 'ScanRefer：伪标注生成 VLM 的选择',
        '图 3(a)（PDF 第 8 页）', vlms, threshold_series(vlms),
        x_label='标注生成模型'),
    'scale': chart('scale', 'ScanRefer：空间描述伪标注的数据规模',
        '图 3(b)（PDF 第 8 页）', scale, threshold_series(scale),
        kind='training', chart_type='line', x_label='伪标注数量',
        note='横轴为训练伪标注数量（10K–40K），各点为对应数据规模下的验证准确率。'),
}
data = {
    'paper': {
        'title': 'UZ3DVG: Unaided Zero-Shot 3D Visual Grounding with Generated Language Conditions',
        'conference': 'CVPR 2026', 'pages': '9547–9557', 'url': PDF,
        'code': 'https://github.com/tanwb/UZ3DVG',
        'provenance': 'Transcribed from the supplied PDF and checked against rendered tables and plots; reported experiments, not an independent training reproduction.',
    },
    'tables': {'table1Mask3d': mask3d, 'table1NonMask3d': non_mask3d,
               'table2': nr3d, 'table3': ablation, 'table4': annotation,
               'figure3a': vlms, 'figure3b': scale},
    'charts': charts,
}
(ROOT / 'src/data/experiments/uz3dvg.json').write_text(
    json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('Wrote src/data/experiments/uz3dvg.json')
