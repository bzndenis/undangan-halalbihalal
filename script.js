const { createApp, ref, reactive, onMounted, computed, onUnmounted } = Vue;

createApp({
    setup() {
        const isLoading = ref(true);
        const isOpened = ref(false);
        const isDark = ref(false);
        const isPlaying = ref(false);
        const bgm = ref(null);
        const scrollProgress = ref(0);
        
        // Countdown logic (Target: 11 April 2026, 10:00:00 WIB)
        // +07:00 for WIB
        const targetDate = new Date("2026-04-11T10:00:00+07:00").getTime();
        let timer = null;
        const countdown = reactive({
            days: '00',
            hours: '00',
            minutes: '00',
            seconds: '00'
        });

        const formatTime = (time) => String(Math.max(0, time)).padStart(2, '0');

        const updateCountdown = () => {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance < 0) {
                clearInterval(timer);
                return;
            }

            countdown.days = formatTime(Math.floor(distance / (1000 * 60 * 60 * 24)));
            countdown.hours = formatTime(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
            countdown.minutes = formatTime(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)));
            countdown.seconds = formatTime(Math.floor((distance % (1000 * 60)) / 1000));
        };

        // Scroll Progress
        const handleScroll = () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            scrollProgress.value = (winScroll / height) * 100;
        };

        // Theme Management
        const toggleDarkMode = () => {
            isDark.value = !isDark.value;
            localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
        };

        // Music Management
        const toggleMusic = () => {
            if (!bgm.value) return;
            
            if (isPlaying.value) {
                bgm.value.pause();
                isPlaying.value = false;
            } else {
                const playPromise = bgm.value.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        isPlaying.value = true;
                    }).catch(error => {
                        isPlaying.value = false;
                        console.log("Audio playback was aborted or failed:", error);
                    });
                } else {
                    isPlaying.value = true;
                }
            }
        };

        const openInvitation = () => {
            isOpened.value = true;
            // Trigger AOS refresh after layout changes
            setTimeout(() => AOS.refresh(), 100);
            
            // Auto play music when opened if not already playing
            if (!isPlaying.value && bgm.value) {
                const playPromise = bgm.value.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        isPlaying.value = true;
                    }).catch(e => {
                        isPlaying.value = false;
                        console.log("Auto-play prevented by browser:", e);
                    });
                } else {
                    isPlaying.value = true;
                }
            }
        };

        onMounted(() => {
            // Initialize theme
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                isDark.value = savedTheme === 'dark';
            } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                isDark.value = true;
            }

            // Remove loading screen after a short delay
            setTimeout(() => {
                isLoading.value = false;
                
                // Wait a bit before initializing AOS to avoid animation glitches
                setTimeout(() => {
                    AOS.init({
                        once: true,
                        offset: 50,
                    });
                }, 100);
            }, 1500);

            // Setup countdown
            updateCountdown();
            timer = setInterval(updateCountdown, 1000);

            // Setup scroll listener
            window.addEventListener('scroll', handleScroll);
        });

        onUnmounted(() => {
            if (timer) clearInterval(timer);
            window.removeEventListener('scroll', handleScroll);
        });

        return {
            isLoading,
            isOpened,
            isDark,
            isPlaying,
            countdown,
            bgm,
            scrollProgress,
            toggleDarkMode,
            toggleMusic,
            openInvitation
        }
    }
}).mount('#app')
