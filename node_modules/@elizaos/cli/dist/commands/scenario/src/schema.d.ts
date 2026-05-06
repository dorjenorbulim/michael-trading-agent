import { z } from 'zod';
export interface EnhancedEvaluationResult {
    evaluator_type: string;
    success: boolean;
    summary: string;
    details: Record<string, unknown>;
}
export interface LLMJudgeResult {
    qualitative_summary: string;
    capability_checklist: CapabilityCheck[];
}
export interface CapabilityCheck {
    capability: string;
    achieved: boolean;
    reasoning: string;
}
export declare const EnhancedEvaluationResultSchema: z.ZodObject<{
    evaluator_type: z.ZodString;
    success: z.ZodBoolean;
    summary: z.ZodString;
    details: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, z.core.$strip>;
export declare const CapabilityCheckSchema: z.ZodObject<{
    capability: z.ZodString;
    achieved: z.ZodBoolean;
    reasoning: z.ZodString;
}, z.core.$strip>;
export declare const LLMJudgeResultSchema: z.ZodObject<{
    qualitative_summary: z.ZodString;
    capability_checklist: z.ZodArray<z.ZodObject<{
        capability: z.ZodString;
        achieved: z.ZodBoolean;
        reasoning: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const EvaluationSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    type: z.ZodLiteral<"string_contains">;
    value: z.ZodString;
    case_sensitive: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"regex_match">;
    pattern: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"file_exists">;
    path: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"trajectory_contains_action">;
    action: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"llm_judge">;
    prompt: z.ZodString;
    expected: z.ZodString;
    model_type: z.ZodOptional<z.ZodString>;
    temperature: z.ZodOptional<z.ZodNumber>;
    json_schema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    capabilities: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"execution_time">;
    max_duration_ms: z.ZodNumber;
    min_duration_ms: z.ZodOptional<z.ZodNumber>;
    target_duration_ms: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"conversation_length">;
    min_turns: z.ZodOptional<z.ZodNumber>;
    max_turns: z.ZodOptional<z.ZodNumber>;
    optimal_turns: z.ZodOptional<z.ZodNumber>;
    target_range: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"conversation_flow">;
    required_patterns: z.ZodArray<z.ZodEnum<{
        question_then_answer: "question_then_answer";
        problem_then_solution: "problem_then_solution";
        clarification_cycle: "clarification_cycle";
        empathy_then_solution: "empathy_then_solution";
        escalation_pattern: "escalation_pattern";
    }>>;
    flow_quality_threshold: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"user_satisfaction">;
    satisfaction_threshold: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    indicators: z.ZodOptional<z.ZodObject<{
        positive: z.ZodOptional<z.ZodArray<z.ZodString>>;
        negative: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
    measurement_method: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        llm_judge: "llm_judge";
        sentiment_analysis: "sentiment_analysis";
        keyword_analysis: "keyword_analysis";
    }>>>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"context_retention">;
    test_memory_of: z.ZodArray<z.ZodString>;
    retention_turns: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    memory_accuracy_threshold: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, z.core.$strip>], "type">;
declare const PluginConfigSchema: z.ZodObject<{
    name: z.ZodString;
    version: z.ZodOptional<z.ZodString>;
    config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    enabled: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
declare const PluginReferenceSchema: z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
    name: z.ZodString;
    version: z.ZodOptional<z.ZodString>;
    config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    enabled: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>]>;
export declare const ScenarioSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    plugins: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
        name: z.ZodString;
        version: z.ZodOptional<z.ZodString>;
        config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        enabled: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, z.core.$strip>]>>>;
    environment: z.ZodObject<{
        type: z.ZodEnum<{
            local: "local";
        }>;
    }, z.core.$strip>;
    setup: z.ZodOptional<z.ZodObject<{
        mocks: z.ZodOptional<z.ZodArray<z.ZodObject<{
            service: z.ZodOptional<z.ZodString>;
            method: z.ZodString;
            when: z.ZodOptional<z.ZodObject<{
                args: z.ZodOptional<z.ZodArray<z.ZodAny>>;
                input: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                context: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                matcher: z.ZodOptional<z.ZodString>;
                partialArgs: z.ZodOptional<z.ZodArray<z.ZodAny>>;
            }, z.core.$strip>>;
            response: z.ZodAny;
            responseFn: z.ZodOptional<z.ZodString>;
            error: z.ZodOptional<z.ZodObject<{
                code: z.ZodString;
                message: z.ZodString;
                status: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>>;
            metadata: z.ZodOptional<z.ZodObject<{
                delay: z.ZodOptional<z.ZodNumber>;
                probability: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>>;
        }, z.core.$strip>>>;
        virtual_fs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, z.core.$strip>>;
    run: z.ZodArray<z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        lang: z.ZodOptional<z.ZodString>;
        code: z.ZodOptional<z.ZodString>;
        input: z.ZodOptional<z.ZodString>;
        evaluations: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
            type: z.ZodLiteral<"string_contains">;
            value: z.ZodString;
            case_sensitive: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"regex_match">;
            pattern: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"file_exists">;
            path: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"trajectory_contains_action">;
            action: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"llm_judge">;
            prompt: z.ZodString;
            expected: z.ZodString;
            model_type: z.ZodOptional<z.ZodString>;
            temperature: z.ZodOptional<z.ZodNumber>;
            json_schema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            capabilities: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"execution_time">;
            max_duration_ms: z.ZodNumber;
            min_duration_ms: z.ZodOptional<z.ZodNumber>;
            target_duration_ms: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"conversation_length">;
            min_turns: z.ZodOptional<z.ZodNumber>;
            max_turns: z.ZodOptional<z.ZodNumber>;
            optimal_turns: z.ZodOptional<z.ZodNumber>;
            target_range: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"conversation_flow">;
            required_patterns: z.ZodArray<z.ZodEnum<{
                question_then_answer: "question_then_answer";
                problem_then_solution: "problem_then_solution";
                clarification_cycle: "clarification_cycle";
                empathy_then_solution: "empathy_then_solution";
                escalation_pattern: "escalation_pattern";
            }>>;
            flow_quality_threshold: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"user_satisfaction">;
            satisfaction_threshold: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
            indicators: z.ZodOptional<z.ZodObject<{
                positive: z.ZodOptional<z.ZodArray<z.ZodString>>;
                negative: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strip>>;
            measurement_method: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
                llm_judge: "llm_judge";
                sentiment_analysis: "sentiment_analysis";
                keyword_analysis: "keyword_analysis";
            }>>>;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"context_retention">;
            test_memory_of: z.ZodArray<z.ZodString>;
            retention_turns: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
            memory_accuracy_threshold: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        }, z.core.$strip>], "type">>;
        conversation: z.ZodOptional<z.ZodObject<{
            max_turns: z.ZodNumber;
            timeout_per_turn_ms: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
            total_timeout_ms: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
            user_simulator: z.ZodObject<{
                model_type: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                temperature: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
                max_tokens: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
                persona: z.ZodString;
                objective: z.ZodString;
                style: z.ZodOptional<z.ZodString>;
                constraints: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
                emotional_state: z.ZodOptional<z.ZodString>;
                knowledge_level: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
                    beginner: "beginner";
                    intermediate: "intermediate";
                    expert: "expert";
                }>>>;
            }, z.core.$strip>;
            termination_conditions: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
                type: z.ZodEnum<{
                    max_turns_reached: "max_turns_reached";
                    user_expresses_satisfaction: "user_expresses_satisfaction";
                    agent_provides_solution: "agent_provides_solution";
                    conversation_stuck: "conversation_stuck";
                    escalation_needed: "escalation_needed";
                    goal_achieved: "goal_achieved";
                    custom_condition: "custom_condition";
                }>;
                description: z.ZodOptional<z.ZodString>;
                keywords: z.ZodOptional<z.ZodArray<z.ZodString>>;
                llm_judge: z.ZodOptional<z.ZodObject<{
                    prompt: z.ZodString;
                    threshold: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
                }, z.core.$strip>>;
            }, z.core.$strip>>>>;
            turn_evaluations: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                type: z.ZodLiteral<"string_contains">;
                value: z.ZodString;
                case_sensitive: z.ZodOptional<z.ZodBoolean>;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"regex_match">;
                pattern: z.ZodString;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"file_exists">;
                path: z.ZodString;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"trajectory_contains_action">;
                action: z.ZodString;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"llm_judge">;
                prompt: z.ZodString;
                expected: z.ZodString;
                model_type: z.ZodOptional<z.ZodString>;
                temperature: z.ZodOptional<z.ZodNumber>;
                json_schema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                capabilities: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"execution_time">;
                max_duration_ms: z.ZodNumber;
                min_duration_ms: z.ZodOptional<z.ZodNumber>;
                target_duration_ms: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"conversation_length">;
                min_turns: z.ZodOptional<z.ZodNumber>;
                max_turns: z.ZodOptional<z.ZodNumber>;
                optimal_turns: z.ZodOptional<z.ZodNumber>;
                target_range: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"conversation_flow">;
                required_patterns: z.ZodArray<z.ZodEnum<{
                    question_then_answer: "question_then_answer";
                    problem_then_solution: "problem_then_solution";
                    clarification_cycle: "clarification_cycle";
                    empathy_then_solution: "empathy_then_solution";
                    escalation_pattern: "escalation_pattern";
                }>>;
                flow_quality_threshold: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"user_satisfaction">;
                satisfaction_threshold: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
                indicators: z.ZodOptional<z.ZodObject<{
                    positive: z.ZodOptional<z.ZodArray<z.ZodString>>;
                    negative: z.ZodOptional<z.ZodArray<z.ZodString>>;
                }, z.core.$strip>>;
                measurement_method: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
                    llm_judge: "llm_judge";
                    sentiment_analysis: "sentiment_analysis";
                    keyword_analysis: "keyword_analysis";
                }>>>;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"context_retention">;
                test_memory_of: z.ZodArray<z.ZodString>;
                retention_turns: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
                memory_accuracy_threshold: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
            }, z.core.$strip>], "type">>>>;
            final_evaluations: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                type: z.ZodLiteral<"string_contains">;
                value: z.ZodString;
                case_sensitive: z.ZodOptional<z.ZodBoolean>;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"regex_match">;
                pattern: z.ZodString;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"file_exists">;
                path: z.ZodString;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"trajectory_contains_action">;
                action: z.ZodString;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"llm_judge">;
                prompt: z.ZodString;
                expected: z.ZodString;
                model_type: z.ZodOptional<z.ZodString>;
                temperature: z.ZodOptional<z.ZodNumber>;
                json_schema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                capabilities: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"execution_time">;
                max_duration_ms: z.ZodNumber;
                min_duration_ms: z.ZodOptional<z.ZodNumber>;
                target_duration_ms: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"conversation_length">;
                min_turns: z.ZodOptional<z.ZodNumber>;
                max_turns: z.ZodOptional<z.ZodNumber>;
                optimal_turns: z.ZodOptional<z.ZodNumber>;
                target_range: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"conversation_flow">;
                required_patterns: z.ZodArray<z.ZodEnum<{
                    question_then_answer: "question_then_answer";
                    problem_then_solution: "problem_then_solution";
                    clarification_cycle: "clarification_cycle";
                    empathy_then_solution: "empathy_then_solution";
                    escalation_pattern: "escalation_pattern";
                }>>;
                flow_quality_threshold: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"user_satisfaction">;
                satisfaction_threshold: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
                indicators: z.ZodOptional<z.ZodObject<{
                    positive: z.ZodOptional<z.ZodArray<z.ZodString>>;
                    negative: z.ZodOptional<z.ZodArray<z.ZodString>>;
                }, z.core.$strip>>;
                measurement_method: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
                    llm_judge: "llm_judge";
                    sentiment_analysis: "sentiment_analysis";
                    keyword_analysis: "keyword_analysis";
                }>>>;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"context_retention">;
                test_memory_of: z.ZodArray<z.ZodString>;
                retention_turns: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
                memory_accuracy_threshold: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
            }, z.core.$strip>], "type">>>>;
            debug_options: z.ZodDefault<z.ZodOptional<z.ZodObject<{
                log_user_simulation: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
                log_turn_decisions: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
                export_full_transcript: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    judgment: z.ZodObject<{
        strategy: z.ZodEnum<{
            all_pass: "all_pass";
            any_pass: "any_pass";
        }>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type Scenario = z.infer<typeof ScenarioSchema>;
export type Evaluation = z.infer<typeof EvaluationSchema>;
export type PluginConfig = z.infer<typeof PluginConfigSchema>;
export type PluginReference = z.infer<typeof PluginReferenceSchema>;
/**
 * Trajectory step interface (matches GitHub ticket #5785 specification)
 */
export interface TrajectoryStep {
    /** Step type: 'thought', 'action', or 'observation' */
    type: 'thought' | 'action' | 'observation';
    /** ISO timestamp string */
    timestamp: string;
    /** Step content based on type */
    content: string | {
        name: string;
        parameters: Record<string, unknown>;
    } | Record<string, unknown>;
}
/**
 * Performance and resource metrics for a scenario run
 */
export interface ScenarioRunMetrics {
    /** Total execution time in seconds */
    execution_time_seconds: number;
    /** Number of LLM API calls made during the run */
    llm_calls: number;
    /** Total tokens consumed (input + output) */
    total_tokens: number;
    /** Additional custom metrics */
    [key: string]: number;
}
/**
 * Comprehensive result structure for a single scenario run.
 * This is the master interface for ticket #5786 that consolidates
 * all data from a scenario execution into a structured JSON output.
 */
export interface ScenarioRunResult {
    /** Unique identifier for this specific run */
    run_id: string;
    /** Identifier linking this run to a specific matrix combination */
    matrix_combination_id: string;
    /** The specific parameter values used for this run */
    parameters: Record<string, unknown>;
    /** Performance and resource metrics collected during execution */
    metrics: ScenarioRunMetrics;
    /** The final text/object response from the agent to the user */
    final_agent_response?: string;
    /** Array of structured evaluation results from the EvaluationEngine */
    evaluations: EnhancedEvaluationResult[];
    /** Array of trajectory steps showing the agent's cognitive process */
    trajectory: TrajectoryStep[];
    /** Error message if the run failed unexpectedly (null for successful runs) */
    error: string | null;
}
export declare const ScenarioRunResultSchema: z.ZodObject<{
    run_id: z.ZodString;
    matrix_combination_id: z.ZodString;
    parameters: z.ZodRecord<z.ZodString, z.ZodAny>;
    metrics: z.ZodObject<{
        execution_time_seconds: z.ZodNumber;
        llm_calls: z.ZodNumber;
        total_tokens: z.ZodNumber;
    }, z.core.$catchall<z.ZodNumber>>;
    final_agent_response: z.ZodOptional<z.ZodString>;
    evaluations: z.ZodArray<z.ZodObject<{
        evaluator_type: z.ZodString;
        success: z.ZodBoolean;
        summary: z.ZodString;
        details: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, z.core.$strip>>;
    trajectory: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<{
            action: "action";
            thought: "thought";
            observation: "observation";
        }>;
        timestamp: z.ZodString;
        content: z.ZodAny;
    }, z.core.$strip>>;
    error: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export {};
//# sourceMappingURL=schema.d.ts.map