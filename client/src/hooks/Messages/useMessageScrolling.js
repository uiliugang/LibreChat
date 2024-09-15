import { useRecoilValue } from 'recoil';
import { Constants } from 'librechat-data-provider';
import { useState, useRef, useCallback, useEffect } from 'react';
import useScrollToRef from '~/hooks/useScrollToRef';
import { useChatContext } from '~/Providers';
import store from '~/store';
const threshold = 0.85;
const debounceRate = 150;
export default function useMessageScrolling(messagesTree) {
    const autoScroll = useRecoilValue(store.autoScroll);
    const scrollableRef = useRef(null);
    const messagesEndRef = useRef(null);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const { conversation, setAbortScroll, isSubmitting, abortScroll } = useChatContext();
    const { conversationId } = conversation ?? {};
    const timeoutIdRef = useRef();
    const debouncedSetShowScrollButton = useCallback((value) => {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = setTimeout(() => {
            setShowScrollButton(value);
        }, debounceRate);
    }, []);
    useEffect(() => {
        if (!messagesEndRef.current || !scrollableRef.current) {
            return;
        }
        const observer = new IntersectionObserver(([entry]) => {
            debouncedSetShowScrollButton(!entry.isIntersecting);
        }, { root: scrollableRef.current, threshold });
        observer.observe(messagesEndRef.current);
        return () => {
            observer.disconnect();
            clearTimeout(timeoutIdRef.current);
        };
    }, [messagesEndRef, scrollableRef, debouncedSetShowScrollButton]);
    const debouncedHandleScroll = useCallback(() => {
        if (messagesEndRef.current && scrollableRef.current) {
            const observer = new IntersectionObserver(([entry]) => {
                debouncedSetShowScrollButton(!entry.isIntersecting);
            }, { root: scrollableRef.current, threshold });
            observer.observe(messagesEndRef.current);
            return () => observer.disconnect();
        }
    }, [debouncedSetShowScrollButton]);
    const scrollCallback = () => debouncedSetShowScrollButton(false);
    const { scrollToRef: scrollToBottom, handleSmoothToRef } = useScrollToRef({
        targetRef: messagesEndRef,
        callback: scrollCallback,
        smoothCallback: () => {
            scrollCallback();
            setAbortScroll(false);
        },
    });
    useEffect(() => {
        if (!messagesTree) {
            return;
        }
        if (isSubmitting && scrollToBottom && !abortScroll) {
            scrollToBottom();
        }
        return () => {
            if (abortScroll) {
                scrollToBottom && scrollToBottom.cancel();
            }
        };
    }, [isSubmitting, messagesTree, scrollToBottom, abortScroll]);
    useEffect(() => {
        if (scrollToBottom && autoScroll && conversationId !== Constants.NEW_CONVO) {
            scrollToBottom();
        }
    }, [autoScroll, conversationId, scrollToBottom]);
    return {
        conversation,
        scrollableRef,
        messagesEndRef,
        scrollToBottom,
        showScrollButton,
        handleSmoothToRef,
        debouncedHandleScroll,
    };
}
