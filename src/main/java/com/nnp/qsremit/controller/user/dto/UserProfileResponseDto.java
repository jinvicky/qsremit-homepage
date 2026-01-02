/**
 * 개발자 : 김연주
 * 개발일 : 2025년 10월 16일
 * 개발목적 :
 - 사용자 정보 조회용 응답 DTO
 - Profile Settings 화면에서 사용자 유형(UserType), ID, 이름(name) 등을 표시하기 위한 데이터 구조 정의
 * 수정사항 :
 */
package com.nnp.qsremit.controller.user.dto;

import com.nnp.qsremit.Entity.user.UserEntity;
import com.nnp.qsremit.Entity.user.UserType;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserProfileResponseDto {
    private String userId;
    private UserType userType;
    private String name;

    public static UserProfileResponseDto fromEntity(UserEntity user) {
        return UserProfileResponseDto.builder()
                .userId(user.getUserId())
                .userType(user.getUserType())
                .name(user.getName())
                .build();
    }
}
