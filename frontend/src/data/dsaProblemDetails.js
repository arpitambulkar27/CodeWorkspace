// Comprehensive DSA Problem Statements, Examples, and Constraints
export const DSA_PROBLEM_DETAILS = {
  "reverse-the-array": {
    statement: "Given an array (or string) of size N, the task is to reverse the array so that the first element becomes the last element, the second element becomes the second-to-last element, and so on.",
    examples: [
      {
        input: "arr = [1, 2, 3, 4, 5]",
        output: "[5, 4, 3, 2, 1]",
        explanation: "Reversing the elements yields [5, 4, 3, 2, 1]."
      },
      {
        input: "arr = [10, 20]",
        output: "[20, 10]",
        explanation: "Swapping 10 and 20 gives [20, 10]."
      }
    ],
    constraints: [
      "1 <= N <= 10^5",
      "-10^9 <= arr[i] <= 10^9"
    ]
  },
  "find-the-maximum-and-minimum-element-in-an-array": {
    statement: "Given an array of size N, write a function to find the minimum and maximum elements in the array using the minimum number of comparisons.",
    examples: [
      {
        input: "arr = [3, 5, 4, 1, 9]",
        output: "Minimum = 1, Maximum = 9",
        explanation: "1 is the smallest element and 9 is the largest element in the array."
      },
      {
        input: "arr = [22, 14, 8, 17, 35, 3]",
        output: "Minimum = 3, Maximum = 35",
        explanation: "3 is the smallest element and 35 is the largest."
      }
    ],
    constraints: [
      "1 <= N <= 10^5",
      "-10^9 <= arr[i] <= 10^9"
    ]
  },
  "kth-smallest-element": {
    statement: "Given an array `arr[]` of positive integers and an integer `K` where K is smaller than the size of the array, the task is to find the Kth smallest element in the given array. It is given that all array elements are distinct.",
    examples: [
      {
        input: "arr = [7, 10, 4, 3, 20, 15], K = 3",
        output: "7",
        explanation: "3rd smallest element in the sorted array [3, 4, 7, 10, 15, 20] is 7."
      },
      {
        input: "arr = [7, 10, 4, 20, 15], K = 4",
        output: "15",
        explanation: "4th smallest element in sorted array [4, 7, 10, 15, 20] is 15."
      }
    ],
    constraints: [
      "1 <= N <= 10^5",
      "1 <= K <= N",
      "1 <= arr[i] <= 10^6"
    ]
  },
  "sort-an-array-of-0s-1s-2s": {
    statement: "Given an array `arr[]` consisting of only 0s, 1s, and 2s. The task is to sort the array in ascending order without using any sorting algorithm (Dutch National Flag Algorithm).",
    examples: [
      {
        input: "arr = [0, 2, 1, 2, 0]",
        output: "[0, 0, 1, 2, 2]",
        explanation: "0s placed first, followed by 1s and 2s."
      },
      {
        input: "arr = [0, 1, 0]",
        output: "[0, 0, 1]",
        explanation: "Sorted order is [0, 0, 1]."
      }
    ],
    constraints: [
      "1 <= N <= 10^6",
      "arr[i] in {0, 1, 2}"
    ]
  },
  "two-sum": {
    statement: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    examples: [
      {
        input: "nums = [2, 7, 11, 15], target = 9",
        output: "[0, 1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      },
      {
        input: "nums = [3, 2, 4], target = 6",
        output: "[1, 2]",
        explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]."
      }
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9"
    ]
  },
  "kadanes-algorithm": {
    statement: "Given an integer array `nums`, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.",
    examples: [
      {
        input: "nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]",
        output: "6",
        explanation: "The contiguous subarray [4, -1, 2, 1] has the largest sum = 6."
      },
      {
        input: "nums = [1]",
        output: "1",
        explanation: "Subarray [1] has sum 1."
      }
    ],
    constraints: [
      "1 <= nums.length <= 10^5",
      "-10^4 <= nums[i] <= 10^4"
    ]
  }
};

// Generates a structured markdown problem statement for any problem
export const getFormattedProblemMarkdown = (title, slug, difficulty, platform, url) => {
  const details = DSA_PROBLEM_DETAILS[slug] || DSA_PROBLEM_DETAILS[slug?.replace(/^lb-|^striver-/, "")];

  const statement = details?.statement || `Given the problem **${title}**, write an optimal algorithm to solve it efficiently. Analyze the required data structures and handle all edge cases.`;

  const examples = details?.examples || [
    {
      input: "Standard sample input values for " + title,
      output: "Expected target output",
      explanation: "Detailed breakdown of the sample evaluation logic."
    }
  ];

  const constraints = details?.constraints || [
    "1 <= N <= 10^5",
    "-10^9 <= Element Values <= 10^9",
    "Expected Time Complexity: O(N) or O(N log N)",
    "Expected Auxiliary Space: O(1) or O(N)"
  ];

  let markdown = `## ${title}\n\n`;
  markdown += `**Difficulty**: \`${difficulty}\` | **Platform**: \`${platform || "LeetCode/GFG"}\` | [View Original on ${platform || "Platform"}](${url})\n\n`;
  markdown += `### Problem Statement\n${statement}\n\n`;

  markdown += `### Examples\n\n`;
  examples.forEach((ex, idx) => {
    markdown += `**Example ${idx + 1}:**\n`;
    markdown += `\`\`\`text\nInput: ${ex.input}\nOutput: ${ex.output}\n\`\`\`\n`;
    markdown += `*Explanation*: ${ex.explanation}\n\n`;
  });

  markdown += `### Constraints\n`;
  constraints.forEach((c) => {
    markdown += `- \`${c}\`\n`;
  });

  return markdown;
};
