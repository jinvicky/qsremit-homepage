/**
 * 개발자 : 한서흔
 * 개발일 : 2025년 07월 23일
 * 개발목적 : Account Deposit의 Address를 Excel 데이터를 통해 저장하기 위한 Dto 설계.
 * 참고 :
 * 수정사항 :
 1. 수정자 / 일자 : 김연주 / 2025년 08월 14일
 - 내용 : @NoAngleBrackets 추가하여 HTML 태그 입력 방지
 */

package com.nnp.qsremit.controller.pgManagement.accountDepositManagement.dto;

import com.nnp.qsremit.validation.annotation.NoAngleBrackets;
import lombok.*;

import java.time.OffsetDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@NoAngleBrackets()
public class AccountDepositAddressTrackingDto {
    private Long id;
    private OffsetDateTime depositDate;
    private String depositName;
    private Long depositAmount;
    private String customerType;
    private String customerNum;
    private String customerName;
    private String customerAddress;

    private OffsetDateTime createdAt;

    private String bank;
    private String accountName;

    private String newAddress;
    private boolean isAddressChanged;

    public static AccountDepositAddressTrackingDto from(AccountDepositForm form, String newAddress) {
        return AccountDepositAddressTrackingDto.builder()
                .id(form.getId())
                .depositDate(form.getDepositDate())
                .depositName(form.getDepositName())
                .depositAmount(form.getDepositAmount())
                .customerType(form.getCustomerType())
                .customerNum(form.getCustomerNum())
                .customerName(form.getCustomerName())
                .customerAddress(form.getCustomerAddress())
                .createdAt(form.getCreatedAt())
                .bank(form.getBank())
                .accountName(form.getAccountName())
                .newAddress(newAddress)
                .isAddressChanged(checkAddressChanged(form.getCustomerAddress(), newAddress))
                .build();
    }

    private static boolean checkAddressChanged(String originalAddress, String newAddress) {
        if (originalAddress == null && newAddress == null) {
            return false;
        }
        if (originalAddress == null || originalAddress.isEmpty() || newAddress == null) {
            return true;
        }
        return !originalAddress.equals(newAddress);
    }
}
