/**
 * 개발자 : 최유진
 * 개발일 : 2025년 06월 30일
 * 개발목적 : Account Deposit을 수동으로 생성할 때 사용하는 dto 클래스
 * 참고 :
 * 수정사항 :
 1. 수정자 / 일자 : 한서흔 / 2025년 07월 21일
 - 내용 : 계좌 색상 표시를 위한 bank와 accountName 필드 추가.
 2. 수정자 / 일자 : 김연주 / 2025년 08월 14일
 - 내용 : @NoAngleBrackets 추가하여 HTML 태그 입력 방지
 */

package com.nnp.qsremit.controller.pgManagement.accountDepositManagement.dto;

import com.nnp.qsremit.validation.annotation.NoAngleBrackets;
import lombok.*;

@Data
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoAngleBrackets()
public class AccountDepositCreateRequestDto {
    private String bank;
    private String accountName;
    private String depositDate;
    private String depositName;
    private String depositAmount;
}
