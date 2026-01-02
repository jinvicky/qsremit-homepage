/**
 * 개발자 : 한서흔
 * 개발일 : 2025년 09월 04일
 * 개발목적 : Daily Summary Management를 위한 통계 dto 설계.
 * 참고 :
 * 수정사항 :
 1. 수정자 / 일자 : 한서흔 / 2025년 09월 24일
 - 내용 : dto 생성을 위한 Setter, Builder 추가
 */

package com.nnp.qsremit.controller.pgManagement.dailySummaryManagement.dto;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AccountDepositSummaryDto {
    private Long counts;
    private Long totalAmount;
}
