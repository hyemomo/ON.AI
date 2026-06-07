"""
ChromaDB 초기 셋업 스크립트
팀원이 처음 클론 후 한 번만 실행하면 됩니다.

실행 방법:
    cd crawler
    pip install -r requirements.txt
    python setup_chroma.py
"""
import sys
from pathlib import Path

src = Path(__file__).parent / "src"
sys.path.insert(0, str(src))

print("=" * 50)
print("ChromaDB 적재 시작")
print("=" * 50)

print("\n[1/4] parent_policy 컬렉션 적재 중...")
sys.path.insert(0, str(src / "parent_policy"))
from parent_policy.chroma_loader import main as load_parent_policy
load_parent_policy()

print("\n[2/4] child_guide 컬렉션 적재 중...")
sys.path.insert(0, str(src / "child_guide"))
from child_guide.chroma_loader import main as load_child_guide
load_child_guide()

print("\n[3/4] parent_action 컬렉션 적재 중...")
sys.path.insert(0, str(src / "parent_action"))
from parent_action.chroma_loader import main as load_parent_action
load_parent_action()

print("\n[4/4] first_aid 컬렉션 적재 중...")
sys.path.insert(0, str(src / "first_aid"))
from first_aid.chroma_loader import main as load_first_aid
load_first_aid()

print("\n" + "=" * 50)
print("ChromaDB 적재 완료! 챗봇을 실행할 수 있습니다.")
print("=" * 50)
