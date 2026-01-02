/**
 * 개발자 : 채호정
 * 개발일 : 2025년 04월 08일
 * 개발목적 :IssueManagementEntity에 대한 CRUD 및 맞춤형 데이터 접근 기능을 제공하기 위한 Repository 인터페이스로,
 *   이슈 관리 데이터를 효율적으로 저장, 조회, 수정, 삭제하는 기능을 지원하며, 향후 특정 기간 내 데이터 조회 등
 *   고급 데이터 처리 기능 확장을 용이하게 하기 위해 설계됨.
 * 참고 :
 * 수정사항:
 1. 수정자 / 일자 : 채호정 / 2025년 04월 08일
 - 내용 : getNextIssueId() 메서드 추가
 2. 수정자 / 일자 : 채호정 / 2025년 04월 09일
 - 내용 : countGroupedByStatus() 메서드 추가
 3. 수정자 / 일자 : 김연주 / 2025년 07월 04일
 - 내용 : 날짜 조회 쿼리 파라미터를 oneWeekAgo -> start 와 now -> end로 수정
 4. 수정자 / 일자 : 한서흔 / 2025년 08월 26일
 - 내용 : 다음 issue 저장 id 찾는 쿼리를 findNextIssueNumber로 수정.
 */
package com.nnp.qsremit.repository.noticeManagement;

import com.nnp.qsremit.Entity.notice.NoticeManagementEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;


@Repository
public interface NoticeManagementRepository extends JpaRepository<NoticeManagementEntity, Long> {
    @Query("SELECT i FROM NoticeManagementEntity i " +
            "WHERE i.createDate BETWEEN :start AND :end " +
            "ORDER BY i.createDate DESC")
    List<NoticeManagementEntity> findByCreateDateBetweenOrderByCreateDateDesc(
            @Param("start") OffsetDateTime start,
            @Param("end") OffsetDateTime end
    );

    @Query("SELECT COALESCE(MAX(i.noticeNumber), 0) + 1 FROM NoticeManagementEntity i")
    Long findNextNoticeNumber();

    Optional<NoticeManagementEntity> findByNoticeNumber(Long noticeNumber);

//    @Query("SELECT i.status AS status, COUNT(i) AS count " +
//            "FROM NoticeManagementEntity i " +
//            "WHERE i.createDate BETWEEN :start AND :end " +
//            "GROUP BY i.status")
//    List<NoticeStatusCountProjection> countGroupedByStatus(@Param("start") OffsetDateTime start,
//                                                          @Param("end") OffsetDateTime end);
}
