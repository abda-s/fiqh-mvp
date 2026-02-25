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
    isRepeatAgain: boolean;
}

export function getLocalYYYYMMDD(date: Date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// @ts-ignore
import supermemo2 from 'supermemo2';

export function calculateSM2(
    quality: number,
    repetitions: number,
    easeFactor: number,
    interval: number
): SRSData {
    // interval = 0 means first time seeing the card, supermemo2 expects null for first schedule
    const lastSchedule = interval === 0 ? null : interval;

    // Execute supermemo2 algorithm
    const result = supermemo2(quality, lastSchedule, easeFactor);

    let newRepetitions = repetitions;
    if (quality >= 3) {
        newRepetitions++;
    } else {
        newRepetitions = 0;
    }

    // supermemo2 result.schedule is 1 when quality is < 3 or lastSchedule is null
    const newInterval = result.schedule;

    // Calculate Next Review Date based on new interval
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

    return {
        easeFactor: result.factor,
        interval: newInterval,
        repetitions: newRepetitions,
        nextReviewDate: getLocalYYYYMMDD(nextReviewDate),
        isRepeatAgain: result.isRepeatAgain
    };
}
