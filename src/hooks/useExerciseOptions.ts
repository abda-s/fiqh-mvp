import { useState, useCallback, useRef } from 'react';

interface ExerciseContent {
    question?: string;
    options?: string[];
    sentence?: string;
    words?: string[];
    correct_order?: number[];
    correct_option?: string;
}

interface UseExerciseOptionsReturn {
    content: ExerciseContent;
    getQuestionText: () => string;
    getQuestionLabel: () => string;
    isCheckDisabled: boolean;
    currentOrder: string | null;
    setCurrentOrder: React.Dispatch<React.SetStateAction<string | null>>;
}

export function useExerciseOptions(
    exercise: any,
    selectedAnswer: string | null
): UseExerciseOptionsReturn {
    const contentRef = useRef<ExerciseContent>({});
    if (exercise) {
        contentRef.current = JSON.parse(exercise.content_json);
    }
    const content = contentRef.current;
    
    const [currentOrder, setCurrentOrder] = useState<string | null>(null);

    const getQuestionText = useCallback(() => {
        if (!exercise) return '';
        
        switch (exercise.type) {
            case 'fill_blank':
                return content.sentence || '';
            case 'ordering':
                return 'رتب الكلمات لترتيب الجملة الصحيحة:';
            default:
                return content.question || '';
        }
    }, [exercise, content]);

    const getQuestionLabel = useCallback(() => {
        if (!exercise) return '';
        
        switch (exercise.type) {
            case 'fill_blank':
                return 'املأ الفراغ:';
            case 'ordering':
                return '';
            default:
                return '';
        }
    }, [exercise]);

    const isCheckDisabled = exercise?.type === 'ordering' 
        ? !currentOrder 
        : !selectedAnswer;

    return {
        content,
        getQuestionText,
        getQuestionLabel,
        isCheckDisabled,
        currentOrder,
        setCurrentOrder
    };
}
