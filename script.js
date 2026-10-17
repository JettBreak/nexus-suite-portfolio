/**
 * Nexus App Suite · Interactive Portfolio Script
 * Ambient Linear SaaS Experience with Delayed Smooth Scroll Physics
 */

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // 1. Lenis Smooth Momentum Inertia Scroll (Delayed Catch-up Physics)
    // -------------------------------------------------------------
    let lenis = null;
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (typeof Lenis !== 'undefined' && !isReducedMotion) {
        lenis = new Lenis({
            duration: 1.35, // Gives that luxurious, weighted delayed momentum glide
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential deceleration
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 0.95,
            touchMultiplier: 1.5,
            infinite: false,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        // Smooth anchor scrolling via Lenis
        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (!href) return;
                
                e.preventDefault();
                if (href === '#' || href === '#hero') {
                    lenis.scrollTo(0, { duration: 1.2 });
                    return;
                }
                const target = document.querySelector(href);
                if (target) {
                    lenis.scrollTo(target, { offset: -80, duration: 1.35 });
                }
            });
        });
    } else {
        // Fallback for native smooth anchor scroll if Lenis is unavailable or reduced motion
        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (!href) return;
                e.preventDefault();
                if (href === '#' || href === '#hero') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    return;
                }
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    // -------------------------------------------------------------
    // 2. Delayed Parallax Depth for Ambient Background Blobs
    // -------------------------------------------------------------
    const blob1 = document.querySelector('.blob-1');
    const blob2 = document.querySelector('.blob-2');

    function updateParallax(scrollY) {
        if (blob1) blob1.style.transform = `translateX(-50%) translateY(${scrollY * 0.14}px)`;
        if (blob2) blob2.style.transform = `translateY(${-scrollY * 0.1}px)`;
    }

    if (lenis) {
        lenis.on('scroll', (e) => updateParallax(e.scroll));
    } else {
        window.addEventListener('scroll', () => updateParallax(window.scrollY), { passive: true });
    }

    // -------------------------------------------------------------
    // 3. Staggered Delayed Scroll-Triggered Entrance Reveals (.reveal)
    // -------------------------------------------------------------
    const revealElements = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && !isReducedMotion) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.08,
            rootMargin: '0px 0px -40px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        // Fallback: immediately activate reveals
        revealElements.forEach(el => el.classList.add('active'));
    }

    // -------------------------------------------------------------
    // 4. Lightbox 2.0 with Full Keyboard & Navigation Support
    // -------------------------------------------------------------
    const lightbox = document.getElementById('lightbox');
    const lbImg = document.getElementById('lb-img');
    const lbCaption = document.getElementById('lb-caption');
    const lbCounter = document.getElementById('lb-counter');
    const lbPrev = document.getElementById('lb-prev');
    const lbNext = document.getElementById('lb-next');
    const lbClose = document.getElementById('lb-close');

    let currentShots = [];
    let currentIndex = 0;

    function refreshShotsList() {
        currentShots = Array.from(document.querySelectorAll('.shot, [data-full]'));
    }
    refreshShotsList();

    function showLightboxIndex(index) {
        if (!currentShots.length) return;
        currentIndex = (index + currentShots.length) % currentShots.length;
        const item = currentShots[currentIndex];
        const fullSrc = item.dataset.full || item.src;
        const imgElem = item.querySelector('img') || item;
        const altText = imgElem.alt || item.dataset.caption || 'Screenshot preview';
        const captionText = item.dataset.caption || altText;

        if (lbCaption) lbCaption.textContent = captionText;
        if (lbCounter) lbCounter.textContent = `${currentIndex + 1} / ${currentShots.length}`;

        const tempImg = new Image();

        if (lightbox.open) {
            // Already open: crossfade to the next/previous image
            lbImg.style.opacity = '0.4';
            lbImg.style.transform = 'scale(0.98)';
            tempImg.onload = () => {
                lbImg.src = fullSrc;
                lbImg.alt = altText;
                lbImg.style.opacity = '1';
                lbImg.style.transform = 'scale(1)';
            };
            tempImg.src = fullSrc;
            return;
        }

        // Opening: wait for the image so the zoom lands on its real size
        tempImg.onload = () => {
            lbImg.src = fullSrc;
            lbImg.alt = altText;
            lbImg.style.opacity = '1';
            lbImg.style.transform = 'none';
            if (lenis) lenis.stop(); // Stop scroll when lightbox opens
            lightbox.classList.remove('closing');
            lightbox.showModal();
            zoomBetween(item, 'open');
        };
        tempImg.src = fullSrc;
    }

    // FLIP zoom: the image grows out of the clicked screenshot and shrinks back into it
    const LB_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
    const lbWrap = lightbox.querySelector('.lightbox-img-wrap');
    let lbAnim = null;

    function zoomBetween(source, direction) {
        if (isReducedMotion || !lbWrap.animate) return Promise.resolve();
        const to = lbWrap.getBoundingClientRect();
        const from = source && source.getBoundingClientRect();
        const onScreen = from && from.width > 0 && from.bottom > 0 && from.top < window.innerHeight;

        const start = onScreen
            ? `translate(${from.left + from.width / 2 - (to.left + to.width / 2)}px, ${from.top + from.height / 2 - (to.top + to.height / 2)}px) scale(${from.width / to.width}, ${from.height / to.height})`
            : 'translateY(24px) scale(0.92)';
        const frames = [
            { transform: start, opacity: onScreen ? 0.6 : 0, borderRadius: '10px' },
            { transform: 'none', opacity: 1 },
        ];

        if (lbAnim) lbAnim.cancel();
        lbAnim = lbWrap.animate(direction === 'open' ? frames : frames.reverse(), {
            duration: direction === 'open' ? 620 : 420,
            easing: direction === 'open' ? LB_EASE : 'cubic-bezier(0.7, 0, 0.84, 0)',
            fill: 'both',
        });
        return lbAnim.finished.catch(() => {});
    }

    function closeLightbox() {
        if (!lightbox.open || lightbox.classList.contains('closing')) return;
        lightbox.classList.add('closing');
        zoomBetween(currentShots[currentIndex], 'close').then(() => {
            lightbox.close();
            lightbox.classList.remove('closing');
            if (lbAnim) { lbAnim.cancel(); lbAnim = null; }
            if (lenis) lenis.start(); // Resume scroll when lightbox closes
        });
    }

    // Esc fires 'cancel' natively; route it through the animated close
    lightbox.addEventListener('cancel', (e) => {
        e.preventDefault();
        closeLightbox();
    });

    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('.shot, [data-full]');
        if (trigger) {
            e.preventDefault();
            refreshShotsList();
            const idx = currentShots.indexOf(trigger);
            if (idx !== -1) {
                showLightboxIndex(idx);
            }
        }
    });

    if (lbPrev) lbPrev.addEventListener('click', (e) => { e.stopPropagation(); showLightboxIndex(currentIndex - 1); });
    if (lbNext) lbNext.addEventListener('click', (e) => { e.stopPropagation(); showLightboxIndex(currentIndex + 1); });
    if (lbClose) lbClose.addEventListener('click', closeLightbox);

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (!lightbox.open) return;
        if (e.key === 'ArrowLeft') showLightboxIndex(currentIndex - 1);
        if (e.key === 'ArrowRight') showLightboxIndex(currentIndex + 1);
        if (e.key === 'Escape') closeLightbox();
    });

    // -------------------------------------------------------------
    // 5. Interactive Feature Spotlight Consoles (Tabbed Screen Previews)
    // -------------------------------------------------------------
    document.querySelectorAll('.console-box').forEach((box) => {
        const tabs = box.querySelectorAll('.console-tab');
        const previewImg = box.querySelector('.console-preview-img');
        const previewCaption = box.querySelector('.console-preview-caption-text');

        tabs.forEach((tab) => {
            tab.addEventListener('click', () => {
                if (tab.classList.contains('active')) return;
                
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                const newSrc = tab.dataset.shot;
                const newAlt = tab.dataset.caption || tab.querySelector('strong').textContent;

                if (previewImg) {
                    previewImg.style.opacity = '0';
                    previewImg.style.transform = 'scale(0.98)';

                    setTimeout(() => {
                        previewImg.src = newSrc;
                        previewImg.alt = newAlt;
                        previewImg.closest('.shot')?.setAttribute('data-full', newSrc);
                        previewImg.closest('.shot')?.setAttribute('data-caption', newAlt);
                        previewImg.style.opacity = '1';
                        previewImg.style.transform = 'scale(1)';
                    }, 180);
                }

                if (previewCaption) {
                    previewCaption.textContent = newAlt;
                }
            });
        });
    });

    // -------------------------------------------------------------
    // 6. 3D Perspective Mouse Tilt for Hero Screenshot
    // -------------------------------------------------------------
    const heroFrame = document.querySelector('.hero-shot-frame');
    if (heroFrame && window.matchMedia('(min-width: 960px)').matches) {
        const container = heroFrame.closest('.hero-shot-container');
        
        container.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            const rotateX = -(y / rect.height) * 14;
            const rotateY = (x / rect.width) * 14;

            heroFrame.style.transform = `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`;
        });

        container.addEventListener('mouseleave', () => {
            heroFrame.style.transform = `perspective(1200px) rotateX(3deg) rotateY(-6deg)`;
        });
    }

    // -------------------------------------------------------------
    // 6b. Layered 3D Showcase: slanted panels that drift with scroll,
    //     scrub on drag (with momentum) and wrap around endlessly
    // -------------------------------------------------------------
    const stage = document.getElementById('marquee-wrapper');
    const stageCards = stage ? Array.from(stage.querySelectorAll('.marquee-card')) : [];

    if (stage && stageCards.length) {
        const SCROLL_FACTOR = 0.55;               // px of travel per px scrolled
        const DRIFT_SPEED = isReducedMotion ? 0 : 18; // px per second of idle drift
        let panelW = 0, spacing = 0, loopW = 0;
        let drift = 0, dragOffset = 0, velocity = 0;
        let current = null;
        let dragging = false, dragStartX = 0, dragLastX = 0, dragMoved = 0, dragLastT = 0;
        let visible = false, lastT = performance.now();

        const getScroll = () => (lenis ? lenis.scroll : window.scrollY);

        function measure() {
            panelW = stageCards[0].offsetWidth;
            const stageW = stage.clientWidth;
            // Overlap panels like stacked sheets, but always span the stage plus one panel
            spacing = Math.max(panelW * 0.56, (stageW + panelW * 1.4) / stageCards.length);
            loopW = spacing * stageCards.length;
        }

        function layout(offset) {
            stageCards.forEach((card, i) => {
                let x = (i * spacing + offset) % loopW;
                if (x < 0) x += loopW;
                x -= panelW * 0.7;
                card.style.setProperty('--x', `${x.toFixed(1)}px`);
                // Left-most panels sit on top, like the front of a fanned deck
                card.style.zIndex = String(Math.round(loopW - x));
            });
        }

        function tick(now) {
            const dt = Math.min((now - lastT) / 1000, 0.05);
            lastT = now;

            if (!dragging) {
                drift -= DRIFT_SPEED * dt;
                dragOffset += velocity * dt;
                velocity *= Math.pow(0.04, dt); // momentum bleeds off within ~1s
            }

            const target = drift + dragOffset - getScroll() * SCROLL_FACTOR;
            // Ease toward the target so scroll-driven movement feels weighted
            current = current === null ? target : current + (target - current) * Math.min(1, dt * 9);
            layout(current);

            if (visible) requestAnimationFrame(tick);
        }

        measure();
        layout(-getScroll() * SCROLL_FACTOR);
        window.addEventListener('resize', measure);

        new IntersectionObserver((entries) => {
            const wasVisible = visible;
            visible = entries[0].isIntersecting;
            if (visible && !wasVisible) {
                lastT = performance.now();
                requestAnimationFrame(tick);
            }
        }, { rootMargin: '100px 0px' }).observe(stage);

        stage.addEventListener('pointerdown', (e) => {
            if (e.button !== 0) return;
            dragging = true;
            dragStartX = dragLastX = e.clientX;
            dragLastT = performance.now();
            dragMoved = 0;
            velocity = 0;
        });

        window.addEventListener('pointermove', (e) => {
            if (!dragging) return;
            const dx = e.clientX - dragLastX;
            const t = performance.now();
            dragOffset += dx;
            velocity = dx / Math.max((t - dragLastT) / 1000, 0.008);
            dragLastX = e.clientX;
            dragLastT = t;
            dragMoved = Math.max(dragMoved, Math.abs(e.clientX - dragStartX));
            if (dragMoved > 6) stage.classList.add('dragging');
        });

        const endDrag = () => {
            if (!dragging) return;
            dragging = false;
            stage.classList.remove('dragging');
            // A pause before release means no fling
            if (performance.now() - dragLastT > 80) velocity = 0;
        };
        window.addEventListener('pointerup', endDrag);
        window.addEventListener('pointercancel', endDrag);

        // A drag shouldn't also open the lightbox on release
        stage.addEventListener('click', (e) => {
            if (dragMoved > 6) {
                e.stopPropagation();
                e.preventDefault();
                dragMoved = 0;
            }
        }, true);
    }

    // -------------------------------------------------------------
    // 7. Cursor Spotlight Hover Glow on Cards
    // -------------------------------------------------------------
    document.querySelectorAll('.feature-card, .stat-card, .arch-app').forEach((card) => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // -------------------------------------------------------------
    // 7b. Stop & Snap per Section: when scrolling settles near a section's
    //     top, glide it into place under the nav. Long sections still scroll
    //     freely in their middle, since only the area near each top snaps.
    // -------------------------------------------------------------
    if (lenis) {
        const NAV_OFFSET = 80; // same offset the anchor links use
        const SETTLE_MS = 140;
        const snapSections = Array.from(document.querySelectorAll('main > section'));
        let settleTimer = null;
        let snapping = false;

        const snapPoints = () => snapSections.map((section, i) =>
            i === 0 ? 0 : Math.min(lenis.limit, Math.max(0, section.getBoundingClientRect().top + lenis.scroll - NAV_OFFSET)));

        function snapToNearest() {
            if (snapping || lenis.isStopped) return;
            const current = lenis.scroll;
            const reach = Math.min(window.innerHeight * 0.3, 320);
            let best = null;
            snapPoints().forEach((point) => {
                const dist = Math.abs(point - current);
                if (dist <= reach && (best === null || dist < Math.abs(best - current))) best = point;
            });
            // Nothing in reach, or already aligned
            if (best === null || Math.abs(best - current) < 2) return;

            snapping = true;
            lenis.scrollTo(best, {
                duration: 0.85,
                easing: (t) => 1 - Math.pow(1 - t, 4),
                onComplete: () => { snapping = false; },
            });
            // In case the glide is interrupted by a new wheel/touch gesture
            setTimeout(() => { snapping = false; }, 1000);
        }

        lenis.on('scroll', () => {
            if (snapping) return;
            clearTimeout(settleTimer);
            settleTimer = setTimeout(snapToNearest, SETTLE_MS);
        });
    }

    // -------------------------------------------------------------
    // 8. Smooth Scroll Spy for Floating Top Nav & Vertical Dots (.....)
    // -------------------------------------------------------------
    const navLinks = document.querySelectorAll('.top nav a.nav-link');
    const dotLinks = document.querySelectorAll('.scroll-dots .dot');

    const sectionsToTrack = [
        { id: 'hero', element: document.getElementById('hero') || document.querySelector('.hero') },
        { id: 'hub', element: document.getElementById('hub') },
        { id: 'inventory', element: document.getElementById('inventory') },
        { id: 'project', element: document.getElementById('project') },
        { id: 'task', element: document.getElementById('task') },
        { id: 'connected', element: document.getElementById('connected') },
        { id: 'tech', element: document.getElementById('tech') },
        { id: 'contact', element: document.getElementById('contact') },
    ].filter(s => s.element !== null);

    function updateScrollSpy() {
        const currentScroll = lenis ? lenis.scroll : window.scrollY;
        const scrollPosition = currentScroll + 180;

        let activeSectionId = null;
        for (const sec of sectionsToTrack) {
            const top = sec.element.offsetTop;
            const height = sec.element.offsetHeight;
            if (scrollPosition >= top && scrollPosition < top + height) {
                activeSectionId = sec.id;
                break;
            }
        }

        // At the very top, always snap active state to hero
        if (currentScroll < 240) {
            activeSectionId = 'hero';
        }

        // Update Top Floating Nav
        navLinks.forEach((link) => {
            const href = link.getAttribute('href');
            if (activeSectionId && href === `#${activeSectionId}`) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Update Vertical Dots (.....)
        dotLinks.forEach((dot) => {
            const section = dot.dataset.section;
            if (section === activeSectionId) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    if (lenis) {
        lenis.on('scroll', updateScrollSpy);
    } else {
        window.addEventListener('scroll', updateScrollSpy, { passive: true });
    }
    updateScrollSpy();

    // -------------------------------------------------------------
    // 9. Mobile Navigation Drawer Toggle
    // -------------------------------------------------------------
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileNav = document.getElementById('mobile-nav');

    if (mobileToggle && mobileNav) {
        mobileToggle.addEventListener('click', () => {
            const isOpen = mobileNav.classList.toggle('open');
            mobileToggle.setAttribute('aria-expanded', isOpen);
        });

        mobileNav.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                mobileNav.classList.remove('open');
                mobileToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // -------------------------------------------------------------
    // 10. Animated Numbers Counter on Scroll
    // -------------------------------------------------------------
    const statCounters = document.querySelectorAll('.stat-count');
    if ('IntersectionObserver' in window) {
        const countObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.dataset.target, 10);
                    const suffix = el.dataset.suffix || '';
                    const duration = 1200;
                    const startTime = performance.now();

                    function updateCount(currentTime) {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        const easeOut = 1 - Math.pow(1 - progress, 3);
                        const currentVal = Math.floor(easeOut * target);

                        el.textContent = currentVal.toLocaleString() + suffix;

                        if (progress < 1) {
                            requestAnimationFrame(updateCount);
                        } else {
                            el.textContent = target.toLocaleString() + suffix;
                        }
                    }

                    requestAnimationFrame(updateCount);
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.2 });

        statCounters.forEach(sc => countObserver.observe(sc));
    }

    // -------------------------------------------------------------
    // 11. Copy Email to Clipboard with Smooth Toast
    // -------------------------------------------------------------
    const copyBtn = document.getElementById('copy-email-btn');
    const toast = document.getElementById('toast');

    if (copyBtn && toast) {
        copyBtn.addEventListener('click', async () => {
            const email = copyBtn.dataset.email || 'christian.sevilleno@yahoo.com';
            try {
                await navigator.clipboard.writeText(email);
                toast.textContent = '✓ Email copied to clipboard!';
                toast.classList.add('show');
                setTimeout(() => toast.classList.remove('show'), 2800);
            } catch (err) {
                window.location.href = `mailto:${email}`;
            }
        });
    }
});
