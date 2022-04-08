package com.habib.webchat.webchat.controller

import org.springframework.messaging.handler.annotation.MessageMapping
import org.springframework.stereotype.Controller
import com.habib.webchat.webchat.model.Message
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.messaging.handler.annotation.Payload
import org.springframework.messaging.handler.annotation.SendTo
import org.springframework.messaging.simp.SimpMessagingTemplate

@Controller
class ChatController {
    @Autowired
    private lateinit var simpMessagingTemplate:SimpMessagingTemplate;

    @MessageMapping("/message") // app/message
    @SendTo("/chatroom/public")
    private fun receivePublicMessage(@Payload message: Message):Message{
        return message
    }
    @MessageMapping("/private-message")
    fun receivePrivateMessage(@Payload message: Message): Message {
        simpMessagingTemplate.convertAndSendToUser(message.receiverName,"/private",message)// /user/habib/private
        return message
    }

}