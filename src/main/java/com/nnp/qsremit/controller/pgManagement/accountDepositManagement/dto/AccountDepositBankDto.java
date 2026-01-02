/**
 * 개발자 : 한서흔
 * 개발일 : 2025년 07월 07일
 * 개발목적 : 은행 계좌 정보를 데이터베이스에 저장하기 위한 Dto 클래스.
 * 참고 :
 * 수정사항 :
 1. 수정자 / 일자 :
 - 내용 :
 */

package com.nnp.qsremit.controller.pgManagement.accountDepositManagement.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AccountDepositBankDto {
    private String bank;
    private String accountName;
}