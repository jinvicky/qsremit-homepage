/**
 * 개발자 : 최유진
 * 개발일 : 2025년 08월 01일
 * 개발목적 : Bank 이름과 code 정보를 전달하기 위한 response dto
 * 참고 :
 * 수정사항 :
 1. 수정자 / 일자 :
 - 내용 :
 */

package com.nnp.qsremit.controller.pgManagement.bankDepositManagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BankCodeResponseDto {
    private String bankName;
    private String bankCode;
}
