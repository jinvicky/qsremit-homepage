/**
 * 개발자 : 채호정
 * 개발일 : 2025년 04월 08일
 * 개발목적 :
 이슈에 첨부된 이미지 정보를 데이터베이스에 저장하기 위한 엔티티입니다.
 각 이미지에는 업로드한 사용자 정보, 관련 이슈의 임시 ID(tempId),
 원본 파일명, 저장된 파일명, 파일 경로, 업로드 시간이 포함됩니다.
 저장된 이미지 파일은 로컬 디스크에 저장되며, 이 엔티티를 통해 메타데이터를 관리합니다.
 * 참고 :
 - 이미지 저장 및 조회는 IssueImageService 에서 처리
 - issueNumber(=tempId) 기반으로 이슈와 매핑됨
 * 수정사항 :
 1. 수정자 / 일자 : 김연주 / 2025년 08월 15일
 - 내용 : 테이블명 entity 제거
 2. 수정자 / 일자 : 한서흔 / 2025년 08월 26일
 - 내용 : Getter 추가.
 */
package com.nnp.qsremit.Entity.notice;

import com.nnp.qsremit.Entity.user.UserEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Entity
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "notice_img")
public class NoticeImgEntity {

    @Id
    @Column(name = "notice_image_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private UserEntity userEntity;

    @Column(name = "notice_temp_id", nullable = false)
    private Long tempId;

    @Column(name = "notice_original_file_name")
    private String originalFileName;

    @Column(name = "notice_file_name", unique = true)
    private String fileName;

    @Column(name = "notice_file_path")
    private String filePath;

    @Column(name = "notice_update_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    @Builder.Default
    private OffsetDateTime uploadedAt = OffsetDateTime.now();
}
