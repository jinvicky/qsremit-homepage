/**
 * 개발자 : 김연주
 * 개발일 : 2025년 10월 16일
 * 개발목적 :
 *  - 사용자의 프로필 조회 및 비밀번호 변경 기능을 제공하는 서비스 클래스
 *  - 사용자도 보안 점검 기준에 따라 직접 비밀번호를 변경할 수 있도록 지원
 * 주요 기능 :
 *  1. getProfile()  : 로그인된 사용자의 기본 프로필 정보 조회
 *  2. changePassword() : 본인 계정 비밀번호 변경 처리
 * 수정사항 :
 */
package com.nnp.qsremit.service.user;

import com.nnp.qsremit.Entity.user.UserEntity;
import com.nnp.qsremit.controller.user.dto.UserProfileRequestDto;
import com.nnp.qsremit.controller.user.dto.UserProfileResponseDto;
import com.nnp.qsremit.service.verification.UserVerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserProfileService {
    private final UserVerificationService userVerificationService;
    private final UserAdminService userAdminService;
    private final PasswordEncoder passwordEncoder;

    /**
     * 비밀번호 변경 화면 유저 정보 전달
     */
    public UserProfileResponseDto getProfile(String userId) {
        UserEntity ecUser = userVerificationService.findByUserId(userId);

        return UserProfileResponseDto.fromEntity(ecUser);
    }

    /**
     * 비밀번호 변경
     */
    @Transactional
    public void changePassword(UserProfileRequestDto dto, String userId) throws Exception {
        if (dto == null) {
            throw new IllegalArgumentException("Invalid request data.");
        }

        String newPassword = dto.getNewPassword().trim();
        String rawCurrentPassword = dto.getCurrentPassword().trim();

        UserEntity user = userVerificationService.findByUserId(dto.getUserId());
        if (!user.getUserId().equals(userId)) {
            throw new AccessDeniedException("You are not authorized to change this password.");
        }

        if (!rawCurrentPassword.isEmpty()) {
            if (!passwordEncoder.matches(rawCurrentPassword, user.getPassword())) {
                throw new IllegalArgumentException("Current password is incorrect.");
            }
        }

        // 비밀번호 검증
        boolean valid = userAdminService.isValidPassword(newPassword);
        if (!valid) {
            throw new Exception("Invalid password");
        }

        // 비밀번호 변경 (null 또는 빈 문자열이 아닐 때만)
        if (!newPassword.isEmpty()) {
            user.changePassword(passwordEncoder.encode(newPassword));
            user.updateTimestamp();
        }
    }
}
