# 🚀 주요 업데이트

포트폴리오 관리 서비스의 1.0.0 정식 버전 출시입니다.

### 기능 요약
- **포트폴리오 관리**: 카드형 UI를 통한 주식 항목 추가, 수정, 삭제 및 동적 UI 생성.
- **실시간 계산**: 투자 총액, 수익률, 수익금 실시간 계산 및 시각적 피드백(색상 적용).
- **데이터 영속성**: 브라우저 로컬 스토리지(`localStorage`)를 이용한 자동 저장 및 포트폴리오 복원.
- **데이터 관리**: JSON 기반 포트폴리오 데이터 Import/Export 및 전체 초기화(Reset) 기능.
- **종합 리스트**: 테이블 UI를 통한 데이터 요약, 컬럼별 정렬(이름, 금액, 수익률), 접기/펼치기 기능.
- **UX 개선**: 입력 필드 가독성 향상, 모달 기반 수정, 반응형 레이아웃 구현.

### 🛠 수정된 파일
- `src/renderer/features/stock/stock.view.ts`
- `src/renderer/features/stock/stock.viewmodel.ts`
- `src/renderer/styles/main.css`
- `src/renderer/core/di/registry.ts`
- `src/renderer/data/storage/storage.repository.ts`
- `README.md`
