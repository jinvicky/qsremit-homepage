/**
* 개발자 : 김연주
* 개발일 : 2025년 04월 15일
* 개발목적 : Allowed IP 관리 Entity 생성
* 참고 : Jakarta Persistence (JPA), Lombok
* 수정사항 :
 1. 수정자 / 일자 : 김연주 / 2025년 06월 27일
 - 내용 : description, validFrom, validTo 필드 추가
*/
package com.nnp.qsremit.Entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

@Entity
@Getter
@Setter
@Builder
@Table(name = "allowed_ip")
@NoArgsConstructor
@AllArgsConstructor
public class AllowedIpEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String ipAddress;

    private String description;

    private OffsetDateTime validFrom;
    private OffsetDateTime validTo;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    private OffsetDateTime updatedAt;

    public void update(String ipAddress, String description, OffsetDateTime validFrom, OffsetDateTime validTo) {
        this.ipAddress = ipAddress.trim();
        this.description = description;
        this.validFrom = validFrom;
        this.validTo = validTo;
    }

}
