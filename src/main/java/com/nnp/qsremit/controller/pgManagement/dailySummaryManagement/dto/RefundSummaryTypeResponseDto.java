///**
// * 개발자 : 한서흔
// * 개발일 : 2025년 09월 11일
// * 개발목적 : Daily Summary Management의 환불 데이터 조회를 위한 Dto 설계.
// * 참고 :
// * 수정사항 :
// 1. 수정자 / 일자 : 한서흔 / 2025년 09월 16일
// - 내용 : BigDecimal 변경.
// */
//
//package com.nnp.qsremit.controller.pgManagement.dailySummaryManagement.dto;
//
//import com.nnp.nextqsremit_core.Entity.pgManagement.dailySummary.RefundSummaryEntity;
//import lombok.Builder;
//import lombok.Getter;
//import lombok.NoArgsConstructor;
//import lombok.Setter;
//
//import java.math.BigDecimal;
//import java.time.OffsetDateTime;
//
//@Getter
//@Setter
//@NoArgsConstructor
//@Builder
//public class RefundSummaryTypeResponseDto {
//    private Long id;
//    private Long accountDepositTypeId;
//
//    private OffsetDateTime depositDate;
//    private String depositName;
//
//    private BigDecimal refundAmount;
//    private BigDecimal refundFee;
//    private BigDecimal totalRefundAmount;
//
//    private String memo;
//
//    private OffsetDateTime createdAt;
//
//    public RefundSummaryTypeResponseDto(
//            Long id,
//            Long accountDepositTypeId,
//            OffsetDateTime depositDate,
//            String depositName,
//            BigDecimal refundAmount,
//            BigDecimal refundFee,
//            BigDecimal totalRefundAmount,
//            String memo,
//            OffsetDateTime createdAt
//    ) {
//        this.id = id;
//        this.accountDepositTypeId = accountDepositTypeId;
//        this.depositDate = depositDate;
//        this.depositName = depositName;
//        this.refundAmount = refundAmount;
//        this.refundFee = refundFee;
//        this.totalRefundAmount = totalRefundAmount;
//        this.memo = memo;
//        this.createdAt = createdAt;
//    }
//
//    public static RefundSummaryTypeResponseDto from(RefundSummaryEntity entity) {
//        return RefundSummaryTypeResponseDto.builder()
//                .id(entity.getId())
//                .accountDepositTypeId(entity.getAccountDepositType().getId())
//                .depositDate(entity.getDepositDate())
//                .depositName(entity.getDepositName())
//                .refundAmount(entity.getRefundAmount())
//                .refundFee(entity.getRefundFee())
//                .totalRefundAmount(entity.getTotalRefundAmount())
//                .memo(entity.getMemo())
//                .build();
//    }
//}
