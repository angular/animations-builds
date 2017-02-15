import { StyleData } from '../common/style_data';
import { AnimationMetadata } from './animation_metadata';
import { AnimationTimelineInstruction } from './animation_timeline_instruction';
/**
 * @experimental Animation support is experimental.
 */
export declare class Animation {
    private _animationAst;
    constructor(input: AnimationMetadata | AnimationMetadata[]);
    buildTimelines(startingStyles: StyleData | StyleData[], destinationStyles: StyleData | StyleData[]): AnimationTimelineInstruction[];
    private create(injector, element, startingStyles?, destinationStyles?);
}
