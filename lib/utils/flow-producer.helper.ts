import type { FlowOpts, FlowJob, FlowQueuesOpts } from 'bullmq'

export type inSequenceFlowOptions = {
  /**
   * Set the job highest priority assigned to the last parent, every child will have lower priority to preserve sequence between same flows avoiding paralell processing
   * @example Highest priority = 1
   * @example Lowest priority (P > 1)
   */
  smartPriority?:number,
  failParentOnFailure?:boolean,
}

/**
 * Process the jobs from first to last of the array, the last one is the last parent
 * @example backup -> remove, install -> finish
 */
export function inSequenceFlow(jobs:Omit<FlowJob,'children'>[],opts:inSequenceFlowOptions = {}) : FlowJob {
  const withOptions:FlowJob[] = jobs.map((job,index) => ({
    ...job,
    opts:{
      ...job.opts,
      ...(opts.failParentOnFailure !== undefined && (index + 1) != jobs.length && {
        failParentOnFailure: opts.failParentOnFailure
      }),
       ...(opts.smartPriority !== undefined && {
        priority: (jobs.length - (index + 1) + opts.smartPriority)
      }),
    }
  }))
  let child = withOptions[0];
  for (let i = 1; i < withOptions.length; i++) {
    const parent = withOptions[i];
    parent.children = [child]; 
    child = parent;
  }
  return child;
}

export function flowQueueOptions(queueName:string,opts?:FlowQueuesOpts[string]): FlowQueuesOpts {
  return {
    [queueName]:opts
  }
}

export function flowOptions(queueName:string) : FlowOpts {
  return {
    queuesOptions:{
      ...flowQueueOptions(queueName,{
        defaultJobOptions:{
          removeOnComplete:{
            age:3600,
            count:100
          },
          removeOnFail:{
            age:3600,
            count:100
          }
        }
      })
    }
  }
}