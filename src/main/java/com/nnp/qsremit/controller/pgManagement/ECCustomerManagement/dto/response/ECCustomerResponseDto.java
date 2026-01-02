///**
// * 개발자 : 한서흔
// * 개발일 : 2025년 05월 29일
// * 개발목적 : EC Customer 상세 정보를 불러오기 위한 Response Dto 설계.
// * 참고 :
// * 수정사항 :
// 1. 수정자 / 일자 : 한서흔 / 2025년 07월 01일
// - 내용 : Branch 속성 삭제.
// 2. 수정자 / 일자 : 한서흔 / 2025년 07월 02일
// - 내용 : ecStatus 속성 추가.
// 3. 수정자 / 일자 : 최유진 / 2025년 07월 10일
// - 내용 : reason을 String 필드로 변경.
// */
//package com.nnp.qsremit.controller.pgManagement.ECCustomerManagement.dto.response;
//
//import com.nnp.nextqsremit_core.Entity.pgManagement.ECCustomer.ECCustomerEntity;
//import com.nnp.nextqsremit_core.Entity.pgManagement.ECCustomer.ECStatus;
//import com.nnp.nextqsremit_core.Entity.pgManagement.ECCustomer.ECType;
//import jakarta.persistence.EnumType;
//import jakarta.persistence.Enumerated;
//import lombok.AllArgsConstructor;
//import lombok.Builder;
//import lombok.Getter;
//import lombok.NoArgsConstructor;
//
//@Getter
//@Builder
//@AllArgsConstructor
//@NoArgsConstructor
//public class ECCustomerResponseDto {
//
//    private Long id;
//
//    private String ecBankName;
//    private String ecAccountNo;
//    private String ecHolderName;
//
//    @Enumerated(EnumType.STRING)
//    @Builder.Default
//    private ECType ecType = ECType.B2C;
//
//    private String ecSenderType;
//    private String ecReason;
//    private String ecReceiver;
//    private String ecReceiverType;
//    private String ecCompanyName;
//    private String ecCompanyAddress;
//
//    @Enumerated(EnumType.STRING)
//    private ECStatus ecStatus;
//
//    public static ECCustomerResponseDto from(ECCustomerEntity entity) {
//        return ECCustomerResponseDto.builder()
//                .id(entity.getId())
//                .ecBankName(entity.getEcBankName())
//                .ecAccountNo(entity.getEcAccountNo())
//                .ecHolderName(entity.getEcHolderName())
//                .ecType(entity.getEcType())
//                .ecSenderType(entity.getEcSenderType())
//                .ecReason(entity.getEcReason())
//                .ecReceiver(entity.getEcReceiver())
//                .ecReceiverType(entity.getEcReceiverType())
//                .ecCompanyName(entity.getEcCompanyName())
//                .ecCompanyAddress(entity.getEcCompanyAddress())
//                .ecStatus(entity.getEcStatus())
//                .build();
//    }
//}
