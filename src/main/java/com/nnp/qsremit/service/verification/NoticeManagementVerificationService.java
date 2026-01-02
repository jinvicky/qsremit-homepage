/**
 * 개발자 : 채호정
 * 개발일 : 2025년 04월 08일
 * 개발목적 :
 *  - 이슈 관리 시스템에서 특정 시간 범위(예: 최근 하루 또는 최근 일주일)에 생성된 이슈를 검증 및 조회하는
 *     비즈니스 로직을 제공하기 위한 서비스 클래스.
 *    - 이슈 데이터의 생성 일시(createDate)를 기준으로 정렬 및 필터링하여, 모든 사용자가 필요한 이슈 정보를
 *    확인할 수 있도록 지원하며, 향후 추가 검증 로직이나 처리 기능 확장에 활용됨.
 * 수정사항 :
 1. 수정자 / 일자 : 채호정 / 2025년 04월 08일
  - 내용 :findByCreateDateBetweenOrderByCreateDateDesc() 추가
 2. 수정자 / 일자 : 채호정 / 2025년 04월 09일
 - 내용 : getRecentIssues() 추가
 3. 수정자 / 일자 : 김연주 / 2025년 07월 04일
 - 내용 : getRecentIssues 메서드에 날짜 범위 파라미터 추가해 조회 기간 유연하게 변경 가능하도록 수정
 4. 수정자 / 일자 : 한서흔 / 2025년 08월 26일
 - 내용 : getNextIssueId > findNextIssueNumber 변경.
 */
package com.nnp.qsremit.service.verification;

import com.nnp.qsremit.Entity.notice.NoticeManagementEntity;
import com.nnp.qsremit.repository.noticeManagement.NoticeManagementRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NoticeManagementVerificationService {

    private final NoticeManagementRepository noticeManagementRepository;

    /**
     * 최근 일주일간 생성된 이슈 리스트를 반환합니다.
     * createDate 기준 최신순으로 정렬됩니다.
     * 모든 권한이 모든 이슈를 확인할 수 있습니다.
     *
     * @return 최근 이슈 리스트
     */
    public List<NoticeManagementEntity> getRecentNotices (OffsetDateTime start, OffsetDateTime end) {

        return noticeManagementRepository.findByCreateDateBetweenOrderByCreateDateDesc(start, end);
    }


    public Long getNextNoticeId(){
        return noticeManagementRepository.findNextNoticeNumber();
    }


    public void save(NoticeManagementEntity issue) {
        noticeManagementRepository.save(issue);
    }

    public long count() {
        return noticeManagementRepository.count();
    }

    public NoticeManagementEntity findByNoticeNumber(Long id) {
        return noticeManagementRepository.findByNoticeNumber(id).orElseThrow(EntityNotFoundException::new);
    }

    public void delete(NoticeManagementEntity entity) {

        noticeManagementRepository.delete(entity);
    }

    public List<NoticeManagementEntity> findAll(){
        return noticeManagementRepository.findAll();
    }
//    public List<NoticeStatusCountProjection> getMonthlyIssueCountByStatus() {
//        OffsetDateTime start = OffsetDateTime.now(ZoneOffset.UTC).minusMonths(1);
//        OffsetDateTime end = OffsetDateTime.now(ZoneOffset.UTC);
//
//        return noticeManagementRepository.countGroupedByStatus(start, end);
//    }
}
