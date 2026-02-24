// SM-2 Spaced Repetition Algorithm Implementation
// Quality specifies the quality of the answer from 0 to 5.
// 5 - perfect response
// 4 - correct response after a hesitation
// 3 - correct response recalled with serious difficulty
// 2 - incorrect response; where the correct one seemed easy to recall
// 1 - incorrect response; the correct one remembered
// 0 - complete blackout.

export interface SRSData {
    easeFactor: number;
    interval: number;
    repetitions: number;
    nextReviewDate: string;
}

export function calculateSM2(
    quality: number,
    repetitions: number,
    easeFactor: number,
    interval: number
): SRSData {
    let newRepetitions = repetitions;
    let newInterval = interval;
    let newEaseFactor = easeFactor;

    // Grade >= 3 means correct response
    if (quality >= 3) {
        if (repetitions === 0) {
            newInterval = 1; // 1 day
        } else if (repetitions === 1) {
            newInterval = 6; // 6 days
        } else {
            newInterval = Math.round(interval * easeFactor);
        }
        newRepetitions++;
    } else {
        // Incorrect response resets repetitions
        newRepetitions = 0;
        newInterval = 1;
    }

    // Update Ease Factor
    newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

    // The ease factor should not fall below 1.3
    if (newEaseFactor < 1.3) {
        newEaseFactor = 1.3;
    }

    // Calculate Next Review Date based on new interval
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

    return {
        easeFactor: newEaseFactor,
        interval: newInterval,
        repetitions: newRepetitions,
        nextReviewDate: nextReviewDate.toISOString().split('T')[0], // YYYY-MM-DD
    };
}
