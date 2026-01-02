/**
 * 개발자 : 한서흔
 * 개발일 : 2025년 09월 11일
 * 개발목적 : Daily Summary Management의 환불 데이터 업데이트를 위한 Dto 설계.
 * 참고 :
 * 수정사항 :
 1. 수정자 / 일자 : 한서흔 / 2025년 09월 16일
 - 내용 : BigDecimal 변경.
 */

package com.nnp.qsremit.controller.pgManagement.dailySummaryManagement.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RefundSummaryTypeUpdateDto {
    private Long id;

    private String depositName;

    private BigDecimal refundAmount;
    private BigDecimal refundFee;

    private String memo;
}
