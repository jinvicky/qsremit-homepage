/**
 * 개발자 : 채호정
 * 개발일 : 2025년 04월 04일
 * 개발목적 :외화 환율 테이블에서 송금 파트너 ID를 기준으로 고객 적용 환율(Customer Rate)을 조회하는 서비스.
 * 참고 :
 *      - fx_rate_partner 테이블의 customer_rate_cust 컬럼 사용.
 *      - FxRatePartnerRepository 인터페이스의 쿼리 메서드와 연계됨.
 * 수정사항 :
 * 1. 수정자 / 일자 : 채호정 / 2025년 04월 16일
 *    - 내용 : findById() 추가.
 */
package com.nnp.qsremit.service.verification;

import com.nnp.qsremit.Entity.user.UserEntity;
import com.nnp.qsremit.Entity.user.UserType;
import com.nnp.qsremit.repository.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserVerificationService {

    private final UserRepository userRepository;

    public UserEntity findByUserId(String userId) {
        return userRepository.findByUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException(userId));
    }

    public UserEntity findById(Long system) {
        return userRepository.findById(system)
                .orElseThrow(() -> new EntityNotFoundException("user not found"));
    }

    public UserEntity findByIdAndUserTypeNot(Long system, UserType userType) {
        return userRepository.findByIdAndUserTypeNot(system, userType)
                .orElseThrow(() -> new EntityNotFoundException("user not found"));
    }
}
