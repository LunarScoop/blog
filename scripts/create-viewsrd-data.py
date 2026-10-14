"""Transcription of ICCV 2025 ViewSRD tables; no inferred or interpolated values.
Run with Python 3. Files are explicitly UTF-8. This script only regenerates this paper's data.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PDF = 'https://openaccess.thecvf.com/content/ICCV2025/papers/Huang_ViewSRD_3D_Visual_Grounding_via_Structured_Multi-View_Decomposition_ICCV_2025_paper.pdf'
SUPP = 'https://openaccess.thecvf.com/content/ICCV2025/supplemental/Huang_ViewSRD_3D_Visual_ICCV_2025_supplemental.pdf'
splits = ['Overall', 'Easy', 'Hard', 'View Dep.', 'View Indep.']

# Table 1: Nr3D five columns followed by Sr3D five columns.
benchmark = [
 ('3DVG-Transformer', [40.8,48.5,34.8,34.8,43.7,51.4,54.2,44.9,44.6,51.7]),
 ('LanguageRefer', [43.9,51.0,36.6,41.7,45.0,56.0,58.9,49.3,49.2,56.3]),
 ('TransRefer3D', [42.1,48.5,36.0,36.5,44.9,57.4,60.5,50.2,49.9,57.7]),
 ('SAT', [49.2,56.3,42.4,46.9,50.4,57.9,61.2,50.0,49.2,58.3]),
 ('MVT', [55.1,61.3,49.1,54.3,55.4,64.5,66.9,58.8,58.4,64.7]),
 ('ViewRefer', [56.0,63.0,49.7,55.1,56.8,67.0,68.9,62.1,52.2,67.7]),
 ('MiKASA', [64.4,69.7,59.4,65.4,64.0,75.2,78.6,67.3,70.4,75.4]),
 ('CoT3DRef', [64.4,70.0,59.2,61.9,65.7,73.2,75.2,67.9,67.6,73.5]),
 ('ViewSRD', [69.9,75.3,64.8,68.6,70.6,76.0,78.3,70.6,69.0,76.2]),
]
anchors = [('MVT',[52.6,56.6,55.1]),('CoT3DRef',[63.1,65.2,64.4]),('ViewSRD',[71.5,69.5,69.9])]
scanrefer = [
 ('MVT',[77.7,66.5,31.9,25.3,40.8,33.3]),
 ('MVT+SRD',[78.6,67.2,34.1,27.1,42.1,34.3]),
 ('BUTD-DETR',[82.8,64.9,44.7,33.9,50.4,38.6]),
 ('BUTD-DETR+SRD',[85.0,66.2,45.3,34.2,57.9,45.7]),
 ('EDA',[80.4,65.3,35.6,25.1,43.6,32.3]),
 ('EDA+SRD',[81.0,67.3,36.4,28.3,44.4,35.3]),
 ('ViewSRD',[82.1,68.2,37.4,29.0,45.4,36.0]),
]
ablation = [
 ('w/o CCVTs',[62.2,68.5,56.1,60.1,63.2]),
 ('w/o Textual M.',[68.0,73.5,62.6,67.6,68.1]),
 ('w/o Scene M.',[64.6,70.5,58.9,63.8,64.9]),
 ('w/o SRD M.',[68.6,73.0,64.8,66.5,70.0]),
 ('w/o Weight',[69.0,74.2,64.0,66.5,70.2]),
 ('LLM-Aug.',[69.1,74.5,63.7,68.0,69.5]),
 ('ViewSRD',[69.9,75.3,64.8,68.6,70.6]),
]
# Table 5: train views, test views, five reported splits.
views = [
 (4,1,[66.0,71.7,60.5,64.0,67.0]), (4,2,[68.9,75.1,63.0,66.9,69.9]),
 (4,4,[69.9,75.3,64.8,68.6,70.6]), (1,1,[64.4,70.9,58.1,60.8,66.2]),
 (2,2,[67.7,73.0,62.5,66.1,68.4]), (8,8,[68.4,74.1,63.0,67.4,68.9]),
]
llms = [('OpenChat',69.6),('DeepSeek-R1',69.9),('Qwen-Plus',70.5),('Qwen-Turbo',70.7)]
weights = [(1,1,0,69.1),(1,0,1,63.9),(1,.25,.25,68.4),(1,.5,.5,69.9),(1,.75,.75,69.6),(1,1,1,69.8)]
raw = dict(table1=dict(benchmark), table2=dict(anchors), table3=dict(scanrefer), table4=dict(ablation), table5=[dict(train=t,test=v,values=a) for t,v,a in views], table6=dict(llms), supplementTable1=weights)

def chart(key,title,table,categories,series,kind='comparison',**extra):
    return dict(id='viewsrd-'+key,title=title,kind=kind,chart='auto',metric='Grounding accuracy',unit='%',valueFormat='percent',decimals=1,xLabel='评估子集',categories=categories,series=[dict(name=n,values=v) for n,v in series],source=dict(label='ViewSRD · '+table,url=SUPP if table.startswith('补充') else PDF,note='作者报告值；非独立复现。未报告标准差，不绘制误差线。'),**extra)

charts = {}
for name,start in [('nr3d',0),('sr3d',5)]:
    charts[name] = chart(name,name.title()+'：三种方法的分组比较','表 1（PDF 第 7 页）',splits,[(n,v[start:start+5]) for n,v in benchmark if n in ['MiKASA','CoT3DRef','ViewSRD']])
charts['anchors'] = chart('anchors','Nr3D：多锚点与单锚点描述','表 2（PDF 第 7 页）',['Multi-Anc','Single-Anc','Overall'],anchors)
charts['ablation'] = chart('ablation','Nr3D：组件消融','表 4（PDF 第 8 页）',[n for n,v in ablation],[(s,[v[j] for _,v in ablation]) for j,s in enumerate(splits) if j in [0,3]],kind='ablation')
charts['ablation']['xLabel'] = '模型配置'
charts['scanrefer'] = chart('scanrefer','ScanRefer：SRD 接入前后的 Overall','表 3（PDF 第 7 页）',[n for n,v in scanrefer],[('Acc@0.25',[v[4] for n,v in scanrefer]),('Acc@0.5',[v[5] for n,v in scanrefer])])
charts['scanrefer']['metric'] = 'Acc@IoU threshold'
charts['scanrefer']['xLabel'] = '方法'
charts['scanrefer']['source']['note'] = '原表照录；BUTD-DETR+SRD 的 Overall 与 Unique/Multiple 分组加权值存在明显不一致，待作者澄清，不用于确定增益结论。IoU 阈值是两个独立指标。'
charts['views'] = chart('views','Nr3D：视角数量与准确率','表 5（PDF 第 8 页）',['1','2','4','8'],[('训练与测试视角数相同',[64.4,67.7,69.9,68.4]),('固定训练 4 视角',[66.0,68.9,69.9,None])],kind='hyperparameter')
charts['views']['chart'] = 'line'
charts['views']['xLabel'] = '测试视角数量'
charts['views']['source']['note'] = '两条曲线对应不同训练协议；固定训练 4 视角、测试 8 视角未报告，保留 null，无插值。'
charts['viewMatrix'] = chart('view-matrix','Nr3D：训练／测试视角组合','表 5（PDF 第 8 页）',['1','2','4','8'],[(f'训练 {t} 视角',[next((v[0] for train,test,v in views if train==t and test==k),None) for k in [1,2,4,8]]) for t in [1,2,4,8]],kind='hyperparameter')
charts['viewMatrix']['xLabel'] = '测试视角数量'
charts['viewMatrix']['source']['note'] = '仅六个组合有报告结果，其余格子为空并在数据表标注缺失；颜色越接近绿色代表准确率越高。'
charts['llms'] = chart('llms','Nr3D：更换 SRD 语言模型','表 6（PDF 第 8 页）',[n for n,v in llms],[('ViewSRD',[v for n,v in llms])],kind='ablation')
charts['llms']['xLabel'] = 'LLM decoupler'
charts['weights'] = chart('weights','Nr3D：辅助损失权重','补充材料表 1（第 3 页）',['0.25','0.5','0.75','1.0'],[('λObj = λSent',[68.4,69.9,69.6,69.8])],kind='hyperparameter')
charts['weights']['xLabel'] = 'λObj = λSent（固定 λRef = 1.0）'
charts['weights']['source']['note'] = '采用补充材料表头与表值。其 G 节段落交换了 λObj/λRef，正文与表格均支持 λRef=1.0、λObj=λSent=0.5。'

data = dict(paper=dict(title='ViewSRD: 3D Visual Grounding via Structured Multi-View Decomposition',conference='ICCV 2025',pages='9726–9736',url=PDF,supplement=SUPP,provenance='Manually transcribed and visually checked against the supplied ICCV PDF. No independent reproduction. No standard deviation reported in these tables.'),tables=raw,charts=charts)
(ROOT/'src/data/experiments/viewsrd.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Wrote src/data/experiments/viewsrd.json from paper tables 1–6 and supplement table 1')
