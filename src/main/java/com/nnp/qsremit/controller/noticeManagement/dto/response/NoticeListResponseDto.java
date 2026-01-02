 /**
 * 개발자 : 채호정
 * 개발일 : 2025년 04월 08일
 * 개발목적 :클라이언트로부터 요청된 이슈 목록 데이터를 응답하기 위한 DTO를 정의.
 *        이 클래스는 이슈의 주요 정보인 제목, 카테고리, 유형을 포함하여,
 *        클라이언트에서 이슈 정보를 효과적으로 표시하고 관리할 수 있도록 지원함.
 * 참고 :
 * 수정사항:
 1. 수정자 / 일자 : 채호정 / 2025년 04월 08일
 - 내용 : dto 필드 정의 및 from 메서드 선언
 2. 수정자 / 일자 : 김연주 / 2025년 04월 18일
 - 내용 : 유저 이름으로 유저 ID 반환 (유저 이름은 선택 입력이기 때문에 빈 값 반환 할 수 있음)
 3. 수정자 / 일자 : 김연주 / 2025년 07월 13일
 - 내용 : assignee(담당자) 필드 추가
 4. 수정자 / 일자 : 한서흔 / 2025년 08월 26일
 - 내용 : issue 이미지 필드 추가, 이미지 반환 시 형태 변경하는 클래스 추가.
*/
package com.nnp.qsremit.controller.noticeManagement.dto.response;

import com.nnp.qsremit.Entity.notice.NoticeImgEntity;
import com.nnp.qsremit.Entity.notice.NoticeManagementEntity;
import com.nnp.qsremit.controller.noticeManagement.dto.NoticeImageDto;
import com.nnp.qsremit.service.noticeManagement.NoticeImageService;
import com.nnp.qsremit.service.util.ApplicationContextProvider;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

 @Getter
 @Builder
 @AllArgsConstructor
 @NoArgsConstructor
 public class NoticeListResponseDto {

     private Long noticeId;
     private String title;
     private String description;
     private String user;
     private String assignee;
     private OffsetDateTime createDate;
     private String thumbnail;
     private String thumbnailBase64;
     private List<NoticeImageDto> images;

     public static NoticeListResponseDto from(NoticeManagementEntity entity) {
         return NoticeListResponseDto.builder()
                 .noticeId(entity.getNoticeNumber())
                 .title(entity.getTitle())
                 .description(entity.getDescription())
                 .user(entity.getUserId().getUserId())
                 .assignee(entity.getAssignee())
                 .createDate(entity.getCreateDate())
                 .thumbnail(entity.getThumbnail())
                 .thumbnailBase64(null)
                 .images(List.of()) // 빈 이미지 리스트 반환
                 .build();
     }

     public static NoticeListResponseDto from(NoticeManagementEntity entity, List<NoticeImgEntity> images, String thumbnailBase64) {
         NoticeImageService imageService = ApplicationContextProvider.getBean(NoticeImageService.class);

         List<NoticeImageDto> imageDtos = images.stream()
                 .map(image -> {
                     NoticeImageDto dto = NoticeImageDto.from(image);
                     String base64Data = imageService.getImageAsBase64(image);
                     return NoticeImageDto.builder()
                             .originalFileName(dto.getOriginalFileName())
                             .fileName(dto.getFileName())
                             .base64Data(base64Data)
                             .build();
                 })
                 .collect(Collectors.toList());

         return NoticeListResponseDto.builder()
                 .noticeId(entity.getNoticeNumber())
                 .title(entity.getTitle())
                 .description(processDescription(entity.getDescription(), imageDtos))
                 .user(entity.getUserId().getUserId())
                 .assignee(entity.getAssignee())
                 .createDate(entity.getCreateDate())
                 .images(imageDtos)
                 .thumbnail(entity.getThumbnail())
                 .thumbnailBase64(thumbnailBase64)
                 .build();
     }

     private static String processDescription(String description, List<NoticeImageDto> images) {
         if (description == null || images == null || images.isEmpty()) {
             return description;
         }

         String processedDescription = description;
         for (int i = 0; i < images.size(); i++) {
             String placeholder = "image" + (i + 1);
             String imageTag = String.format("<img src='%s' alt='%s' class='noticeManagement-image'>",
                     images.get(i).getBase64Data(),
                     images.get(i).getOriginalFileName());
             processedDescription = processedDescription.replace(placeholder, imageTag);
         }
         return processedDescription;
     }
 }
