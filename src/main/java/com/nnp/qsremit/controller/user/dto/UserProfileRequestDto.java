/**
 * 개발자 : 김연주
 * 개발일 : 2025년 10월 16일
 * 개발목적 :
 - 사용자가 자신의 비밀번호를 직접 변경할 수 있도록 요청 데이터를 전달하는 DTO
 - 기존 비밀번호 검증 및 새 비밀번호 갱신을 위한 데이터 구조 정의
 * 수정사항 :
 */

package com.nnp.qsremit.controller.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserProfileRequestDto {

    @NotBlank(message = "User ID is required.")
    private String userId;

    @NotBlank(message = "New password is required.")
    @Size(min = 14, message = "Password must be at least 14 characters long.")
    private String newPassword;

    @NotBlank(message = "Current password is required.")
    private String currentPassword;
}
