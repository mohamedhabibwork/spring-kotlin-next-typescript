package com.habib.webchat.webchat.model

import lombok.*

//import org.springframework.data.annotation.Id
//import org.springframework.data.relational.core.mapping.Table

//@Table("MESSAGES")
//data class Message(
//    @Id val id: String?,
//    val text: String
//)

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
class Message(
    public val senderName: String = "",
    public val receiverName: String = "",
    public val message: String = "",
    public val status: Status = Status.MESSAGE
) {
}