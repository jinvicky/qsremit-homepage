/**
 * 개발자 : 채호정
 * 개발일 : 2025년 04월 09일
 * 개발목적 :
 - 이슈 관리 시스템에서 이슈의 제목, 우선순위, 카테고리, 유형, 설명 등의 정보를 수정할 때
 클라이언트로부터 전달받는 데이터를 담기 위한 요청 DTO 클래스입니다.
 - 프론트엔드 또는 외부 API에서 전달된 JSON 데이터를 객체 형태로 매핑하며,
 서비스 계층에서 엔티티에 반영되기 전 데이터 유효성 검사 및 처리에 활용됩니다.
 * 수정사항 :
 1. 수정자 / 일자 : 김연주 / 2025년 04월 21일
 - 내용 : status 필드 추가
 2. 수정자 / 일자 : 김연주 / 2025년 07월 13일
 - 내용 : assignee 필드 추가
 3. 수정자 / 일자 : 최유진 / 2025년 08월 13일
 - 내용 : setter 추가
 4. 수정자 / 일자 : 김연주 / 2025년 08월 14일
 - 내용 : @NoAngleBrackets 추가하여 HTML 태그 입력 방지
*/
package com.nnp.qsremit.controller.noticeManagement.dto.request;

import com.nnp.qsremit.validation.annotation.NoAngleBrackets;
import lombok.*;


@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@NoAngleBrackets(excludeFields = { "description" })
public class updateNoticeRequestDto {
    private String title;
    private String description;
    private String assignee;
}
