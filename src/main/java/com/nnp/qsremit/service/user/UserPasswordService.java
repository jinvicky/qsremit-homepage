/**
 * 개발자 : 김연주
 * 개발일 : 2025년 09월 30일
 * 개발목적 : 사용자 비밀번호 재설정 여부를 해제하여 정상 로그인 가능 상태로 전환
 * 수정사항 :
 1. 수정자 / 일자 :
 - 내용 :
 */

package com.nnp.qsremit.service.user;

import com.nnp.qsremit.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserPasswordService {
    private final UserRepository userRepository;
    /**
     * ResetPassword 해제
     */
    @Transactional
    public void resetPasswordTurnToFalse(Long id) {
        userRepository.findById(id).ifPresent(user -> user.setResetPassword(false));
    }
}
