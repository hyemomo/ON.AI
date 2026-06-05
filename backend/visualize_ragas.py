import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np

plt.rcParams['font.family'] = 'Malgun Gothic'
plt.rcParams['axes.unicode_minus'] = False

metrics = [
    ("Faithfulness",      0.869, "#E84D5C", "환각 방지"),
    ("Answer Relevancy",  0.710, "#FF8E9B", "답변 관련성"),
    ("Context Recall",    0.625, "#FFB3BC", "문서 검색률"),
    ("Context Precision", 0.369, "#FFCDD2", "검색 정밀도 ※"),
]

fig, axes = plt.subplots(1, 4, figsize=(14, 5))
fig.patch.set_facecolor('#FFF8F8')

for ax, (name, score, color, subtitle) in zip(axes, metrics):
    ax.set_facecolor('#FFF8F8')

    # 배경 도넛
    ax.pie([1], radius=1.0, colors=['#F0E0E0'],
           wedgeprops=dict(width=0.32, edgecolor='white'))

    # 점수 도넛
    ax.pie([score, 1 - score], radius=1.0,
           colors=[color, '#F0E0E0'],
           startangle=90,
           wedgeprops=dict(width=0.32, edgecolor='white'))

    # 중앙 점수
    ax.text(0, 0.08, f"{score*100:.1f}%",
            ha='center', va='center',
            fontsize=22, fontweight='bold', color='#2D1A1E')

    # 지표명
    ax.text(0, -0.18, name,
            ha='center', va='center',
            fontsize=11, fontweight='bold', color='#2D1A1E')

    # 부제
    ax.text(0, -0.38, subtitle,
            ha='center', va='center',
            fontsize=9, color='#9B6B75')

    ax.set_xlim(-1.3, 1.3)
    ax.set_ylim(-1.3, 1.3)
    ax.axis('off')

# 제목
fig.text(0.5, 0.97, 'ON.AI RAG 시스템 품질 평가 (RAGAS)',
         ha='center', va='top', fontsize=15, fontweight='bold', color='#2D1A1E')

# 주석
fig.text(0.5, 0.03,
         '※ Context Precision은 단일 청크 DB 구조상 낮게 측정됨 (정답이 1개 문서에 집중)',
         ha='center', va='bottom', fontsize=8.5, color='#9B6B75', style='italic')

plt.tight_layout(rect=[0, 0.06, 1, 0.94])
plt.savefig('ragas_result.png', dpi=180, bbox_inches='tight',
            facecolor='#FFF8F8')
plt.show()
print("ragas_result.png 저장 완료")
