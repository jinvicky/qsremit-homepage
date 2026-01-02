/**
 * 개발자 : 채호정
 * 개발일 : 2025년 04월 08일
 * 개발목적 :사용자와 연계된 이슈(문제/요청) 관리를 위해 이슈의 기본 정보를 저장하는 엔티티로,
 *    각 이슈의 고유 식별자, 관련 사용자 정보, 생성 일시 등을 관리하여 이슈 처리 및 기록에 활용함.
 * 참고 :
 * 수정사항:
 1. 수정자 / 일자 : 채호정 / 2025년 04월 08일
 - 내용 : 엔티티 칼럼 추가
 2. 수정자 / 일자 : 채호정 / 2025년 04월 09일
 - 내용 : updateFromDto() 추가
 3. 수정자 / 일자 : 김연주 / 2025년 04월 21일
 - 내용 : updateFromDto 메서드에 status 업데이트 로직 추가
 4. 수정자 / 일자 : 김연주 / 2025년 07월 07일
 - 내용 : `COMPLETED` 상태로 변경될 때 `endDate`자동 세팅
 5. 수정자 / 일자 : 김연주 / 2025년 07월 08월
 - 내용 : `COMPLETED` 상태로 변경될 때 `endDate` 세팅 조건 추가
 6. 수정자 / 일자 : 김연주 / 2025년 07월 13월
 - 내용 : assignee(담당자) 필드 추가
 7. 수정자 / 일자 : 김연주 / 2025년 08월 15일
 - 내용 : 테이블명 entity 제거
 */
package com.nnp.qsremit.Entity.notice;

import com.nnp.qsremit.Entity.user.UserEntity;
import com.nnp.qsremit.controller.noticeManagement.dto.request.updateNoticeRequestDto;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Entity
@Getter
@Builder(toBuilder = true)
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "notice_management")
public class NoticeManagementEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notice_management_id")
    private Long id;

    @Column(name = "notice_number", unique = true)
    private Long noticeNumber;

    @Column(name = "thumbnail")
    private String thumbnail;

    @Column(name = "notice_title")
    private String title;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private UserEntity userId;

    @Column(name = "notice_description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "notice_assignee")
    private String assignee;

    @Column(name = "notice_create_date",columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime createDate;

    @Column(name = "notice_end_date",columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime endDate;

    @Column(name = "notice_update_at",columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime updateAt;

    public void updateFromDto(updateNoticeRequestDto dto) {
        this.title = dto.getTitle();
        this.description = dto.getDescription();
        this.assignee = dto.getAssignee();
        this.updateAt = OffsetDateTime.now();
    }

    public void changeThumbnail(String thumbnailName) {
        this.thumbnail = thumbnailName;
    }
}
