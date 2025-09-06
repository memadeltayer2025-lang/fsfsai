document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const messagesDiv = document.getElementById('messages');
    const quickActionBtns = document.querySelectorAll('.quick-action-btn');

    const BOT_AVATAR = 'https://via.placeholder.com/40';
    const USER_AVATAR = 'https://via.placeholder.com/40';
    
    // ضع مفتاح API الذي نسخته من موقع OpenAI هنا
    const API_KEY = "Authorization: Bearer OPENAI_API_KEY"; 
    const MODEL_ID = "gpt-3.5-turbo";

    function addMessage(sender, text, avatar) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');

        const avatarImg = document.createElement('img');
        avatarImg.src = avatar;
        avatarImg.alt = sender === 'user' ? 'صورة المستخدم' : 'صورة خبير النحو';
        avatarImg.classList.add('avatar');

        const textParagraph = document.createElement('p');
        textParagraph.textContent = text;

        if (sender === 'user') {
            messageElement.appendChild(textParagraph);
            messageElement.appendChild(avatarImg);
        } else {
            messageElement.appendChild(avatarImg);
            messageElement.appendChild(textParagraph);
        }

        messagesDiv.appendChild(messageElement);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userText = userInput.value.trim();

        if (userText) {
            addMessage('user', userText, USER_AVATAR);
            userInput.value = '';

            const botResponse = await getAIResponse(userText);
            addMessage('bot', botResponse, BOT_AVATAR);
        }
    });

    quickActionBtns.forEach(button => {
        button.addEventListener('click', async () => {
            const actionText = button.dataset.action;
            addMessage('user', actionText, USER_AVATAR);

            const botResponse = await getAIResponse(actionText);
            addMessage('bot', botResponse, BOT_AVATAR);
        });
    });

    async function getAIResponse(prompt) {
        try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: MODEL_ID,
                    messages: [
                        { role: "system", content: "أنت خبير في النحو العربي. مهمتك هي الإجابة على أسئلة الطلاب في النحو للمرحلتين الابتدائية والإعدادية. اجعل إجاباتك بسيطة ومباشرة." },
                        { role: "user", content: prompt }
                    ]
                })
            });
            const data = await response.json();

            if (data.choices && data.choices.length > 0) {
                return data.choices[0].message.content;
            } else {
                console.error("لم يتم العثور على إجابة في استجابة OpenAI:", data);
                return "عذراً، لم أتمكن من الحصول على إجابة. هل يمكن أن تجرب سؤالًا آخر؟";
            }
        } catch (error) {
            console.error("خطأ في استدعاء OpenAI API:", error);
            return "عذراً، حدث خطأ أثناء محاولة جلب الإجابة. يرجى المحاولة لاحقًا.";
        }
    }
});
