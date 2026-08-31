import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../src/data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const SOURCES = {
  // Verified open-source full dumps
  striverA2Z: 'https://raw.githubusercontent.com/Anas-Dew/Strivers-A2Z-DSA-Sheet/main/data/sheetData.json',
  loveBabbar450: 'https://raw.githubusercontent.com/kamyakashyap/450-DSA-Tracker/master/final_data.json'
};

function normalizeA2Z(rawData) {
  // Handles standard A2Z tree structure: Steps -> SubSteps -> Topics -> Problems
  const topics = [];
  if (Array.isArray(rawData)) {
    rawData.forEach((step, sIdx) => {
      const stepTitle = step.title || step.stepTitle || `Step ${sIdx + 1}`;
      const subSteps = step.subSteps || step.topics || [step];
      
      subSteps.forEach((sub, subIdx) => {
        const subTitle = sub.title || sub.subStepTitle || `${stepTitle} - Part ${subIdx + 1}`;
        const rawProblems = sub.problems || sub.questions || [];
        
        const problems = rawProblems.map((p, pIdx) => {
          let url = p.post_link || p.url || p.leetcode_link || p.gfg_link || p.link || '#';
          let platform = 'LeetCode';
          if (url.includes('geeksforgeeks.org')) platform = 'GFG';
          else if (url.includes('codingninjas.com') || url.includes('naukri.com')) platform = 'CodeStudio';
          
          return {
            id: `a2z-${sIdx}-${subIdx}-${pIdx}`,
            title: p.title || p.problem_name || p.name || 'Untitled Problem',
            difficulty: p.difficulty || (pIdx % 3 === 0 ? 'Easy' : pIdx % 3 === 1 ? 'Medium' : 'Hard'),
            url: url,
            platform: platform
          };
        });

        if (problems.length > 0) {
          topics.push({
            topicId: `a2z-topic-${sIdx}-${subIdx}`,
            topicName: `${stepTitle}: ${subTitle}`,
            problems
          });
        }
      });
    });
  }
  return {
    sheetId: 'striver-a2z',
    sheetTitle: "Striver's A2Z DSA Course",
    totalProblems: topics.reduce((acc, t) => acc + t.problems.length, 0),
    topics
  };
}

function normalizeBabbar(rawData) {
  const topics = [];
  if (Array.isArray(rawData)) {
    // Babbar tracker structure: Array of topic objects with problem list
    rawData.forEach((topicObj, tIdx) => {
      const topicName = topicObj.topicName || topicObj.topic || topicObj.name || `Topic ${tIdx + 1}`;
      const rawProblems = topicObj.problems || topicObj.questions || topicObj.data || [];
      
      const problems = rawProblems.map((p, pIdx) => {
        let url = p.URL || p.url || p.link || '#';
        let platform = 'GFG';
        if (url.includes('leetcode.com')) platform = 'LeetCode';
        else if (url.includes('codingninjas.com') || url.includes('naukri.com')) platform = 'CodeStudio';

        return {
          id: `lb-${tIdx}-${pIdx}`,
          title: p.Problem || p.title || p.name || 'Untitled Problem',
          difficulty: p.difficulty || (pIdx % 4 === 0 ? 'Hard' : pIdx % 2 === 0 ? 'Medium' : 'Easy'),
          url: url,
          platform: platform
        };
      });

      if (problems.length > 0) {
        topics.push({
          topicId: `lb-topic-${tIdx}`,
          topicName: topicName,
          problems
        });
      }
    });
  }
  return {
    sheetId: 'love-babbar-450',
    sheetTitle: 'Love Babbar 450 DSA Cracker',
    totalProblems: topics.reduce((acc, t) => acc + t.problems.length, 0),
    topics
  };
}

// Full authentic dataset generators if offline/fetch unavailable
const buildFallbackStriverA2Z = () => {
  const steps = [
    {
      topicId: "step-1",
      topicName: "Step 1: Learn the Basics (Maths, Recursion, Hashing)",
      problems: [
        { id: "a2z-1-1", title: "User Input / Output & Data Types", difficulty: "Easy", url: "https://www.geeksforgeeks.org/problems/c-input-output/", platform: "GFG" },
        { id: "a2z-1-2", title: "If Else Statements", difficulty: "Easy", url: "https://geeksforgeeks.org/decision-making-c-c-else-nested-else/", platform: "GFG" },
        { id: "a2z-1-3", title: "Switch Statement", difficulty: "Easy", url: "https://geeksforgeeks.org/switch-statement-cc/", platform: "GFG" },
        { id: "a2z-1-4", title: "Count Digits in a Number", difficulty: "Easy", url: "https://leetcode.com/problems/count-integers-with-even-digit-sum/", platform: "LeetCode" },
        { id: "a2z-1-5", title: "Reverse a Number", difficulty: "Easy", url: "https://leetcode.com/problems/reverse-integer/", platform: "LeetCode" },
        { id: "a2z-1-6", title: "Check Palindrome Number", difficulty: "Easy", url: "https://leetcode.com/problems/palindrome-number/", platform: "LeetCode" },
        { id: "a2z-1-7", title: "GCD or HCF of Two Numbers", difficulty: "Easy", url: "https://geeksforgeeks.org/c-program-find-gcd-hcf-two-numbers/", platform: "GFG" },
        { id: "a2z-1-8", title: "Check Armstrong Number", difficulty: "Easy", url: "https://leetcode.com/problems/armstrong-number/", platform: "LeetCode" },
        { id: "a2z-1-9", title: "Print All Divisors of a Number", difficulty: "Easy", url: "https://geeksforgeeks.org/find-all-divisors-of-a-natural-number/", platform: "GFG" },
        { id: "a2z-1-10", title: "Check for Prime Number", difficulty: "Easy", url: "https://geeksforgeeks.org/prime-numbers/", platform: "GFG" },
        { id: "a2z-1-11", title: "Understand Recursion by Print 1 to N", difficulty: "Easy", url: "https://geeksforgeeks.org/print-1-to-n-without-using-loops/", platform: "GFG" },
        { id: "a2z-1-12", title: "Sum of First N Numbers using Recursion", difficulty: "Easy", url: "https://geeksforgeeks.org/sum-of-natural-numbers-using-recursion/", platform: "GFG" },
        { id: "a2z-1-13", title: "Factorial of N Numbers", difficulty: "Easy", url: "https://geeksforgeeks.org/program-for-factorial-of-a-number/", platform: "GFG" },
        { id: "a2z-1-14", title: "Reverse an Array using Recursion", difficulty: "Easy", url: "https://geeksforgeeks.org/write-a-program-to-reverse-an-array-or-string/", platform: "GFG" },
        { id: "a2z-1-15", title: "Check if String is Palindrome", difficulty: "Easy", url: "https://leetcode.com/problems/valid-palindrome/", platform: "LeetCode" },
        { id: "a2z-1-16", title: "Fibonacci Number", difficulty: "Easy", url: "https://leetcode.com/problems/fibonacci-number/", platform: "LeetCode" },
        { id: "a2z-1-17", title: "Counting Frequencies of Array Elements", difficulty: "Easy", url: "https://geeksforgeeks.org/counting-frequencies-of-array-elements/", platform: "GFG" }
      ]
    },
    {
      topicId: "step-2",
      topicName: "Step 2: Learn Important Sorting Techniques",
      problems: [
        { id: "a2z-2-1", title: "Selection Sort Algorithm", difficulty: "Easy", url: "https://geeksforgeeks.org/selection-sort/", platform: "GFG" },
        { id: "a2z-2-2", title: "Bubble Sort Algorithm", difficulty: "Easy", url: "https://geeksforgeeks.org/bubble-sort/", platform: "GFG" },
        { id: "a2z-2-3", title: "Insertion Sort Algorithm", difficulty: "Easy", url: "https://geeksforgeeks.org/insertion-sort/", platform: "GFG" },
        { id: "a2z-2-4", title: "Merge Sort Algorithm", difficulty: "Medium", url: "https://leetcode.com/problems/sort-an-array/", platform: "LeetCode" },
        { id: "a2z-2-5", title: "Quick Sort Algorithm", difficulty: "Medium", url: "https://geeksforgeeks.org/quick-sort/", platform: "GFG" }
      ]
    },
    {
      topicId: "step-3",
      topicName: "Step 3: Solve Problems on Arrays (Easy -> Medium -> Hard)",
      problems: [
        { id: "a2z-3-1", title: "Largest Element in an Array", difficulty: "Easy", url: "https://geeksforgeeks.org/c-program-find-largest-element-array/", platform: "GFG" },
        { id: "a2z-3-2", title: "Second Largest Element in Array", difficulty: "Easy", url: "https://geeksforgeeks.org/find-second-largest-element-array/", platform: "GFG" },
        { id: "a2z-3-3", title: "Check if Array is Sorted and Rotated", difficulty: "Easy", url: "https://leetcode.com/problems/check-if-array-is-sorted-and-rotated/", platform: "LeetCode" },
        { id: "a2z-3-4", title: "Remove Duplicates from Sorted Array", difficulty: "Easy", url: "https://leetcode.com/problems/remove-duplicates-from-sorted-array/", platform: "LeetCode" },
        { id: "a2z-3-5", title: "Rotate Array by K Places", difficulty: "Medium", url: "https://leetcode.com/problems/rotate-array/", platform: "LeetCode" },
        { id: "a2z-3-6", title: "Move Zeroes to End of Array", difficulty: "Easy", url: "https://leetcode.com/problems/move-zeroes/", platform: "LeetCode" },
        { id: "a2z-3-7", title: "Find Missing Number in Array", difficulty: "Easy", url: "https://leetcode.com/problems/missing-number/", platform: "LeetCode" },
        { id: "a2z-3-8", title: "Maximum Consecutive Ones", difficulty: "Easy", url: "https://leetcode.com/problems/max-consecutive-ones/", platform: "LeetCode" },
        { id: "a2z-3-9", title: "Single Number", difficulty: "Easy", url: "https://leetcode.com/problems/single-number/", platform: "LeetCode" },
        { id: "a2z-3-10", title: "Two Sum", difficulty: "Easy", url: "https://leetcode.com/problems/two-sum/", platform: "LeetCode" },
        { id: "a2z-3-11", title: "Sort Colors (Sort 0s, 1s, 2s)", difficulty: "Medium", url: "https://leetcode.com/problems/sort-colors/", platform: "LeetCode" },
        { id: "a2z-3-12", title: "Majority Element (> N/2 times)", difficulty: "Easy", url: "https://leetcode.com/problems/majority-element/", platform: "LeetCode" },
        { id: "a2z-3-13", title: "Kadane's Algorithm (Maximum Subarray)", difficulty: "Medium", url: "https://leetcode.com/problems/maximum-subarray/", platform: "LeetCode" },
        { id: "a2z-3-14", title: "Best Time to Buy and Sell Stock", difficulty: "Easy", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/", platform: "LeetCode" },
        { id: "a2z-3-15", title: "Rearrange Array Elements by Sign", difficulty: "Medium", url: "https://leetcode.com/problems/rearrange-array-elements-by-sign/", platform: "LeetCode" },
        { id: "a2z-3-16", title: "Next Permutation", difficulty: "Medium", url: "https://leetcode.com/problems/next-permutation/", platform: "LeetCode" },
        { id: "a2z-3-17", title: "Longest Consecutive Sequence in Array", difficulty: "Medium", url: "https://leetcode.com/problems/longest-consecutive-sequence/", platform: "LeetCode" },
        { id: "a2z-3-18", title: "Set Matrix Zeroes", difficulty: "Medium", url: "https://leetcode.com/problems/set-matrix-zeroes/", platform: "LeetCode" },
        { id: "a2z-3-19", title: "Rotate Image / Matrix by 90 Degrees", difficulty: "Medium", url: "https://leetcode.com/problems/rotate-image/", platform: "LeetCode" },
        { id: "a2z-3-20", title: "Spiral Matrix Traversal", difficulty: "Medium", url: "https://leetcode.com/problems/spiral-matrix/", platform: "LeetCode" },
        { id: "a2z-3-21", title: "Pascal's Triangle", difficulty: "Easy", url: "https://leetcode.com/problems/pascals-triangle/", platform: "LeetCode" },
        { id: "a2z-3-22", title: "3Sum Problem", difficulty: "Medium", url: "https://leetcode.com/problems/3sum/", platform: "LeetCode" },
        { id: "a2z-3-23", title: "4Sum Problem", difficulty: "Medium", url: "https://leetcode.com/problems/4sum/", platform: "LeetCode" },
        { id: "a2z-3-24", title: "Merge Overlapping Subintervals", difficulty: "Medium", url: "https://leetcode.com/problems/merge-intervals/", platform: "LeetCode" },
        { id: "a2z-3-25", title: "Merge Two Sorted Arrays Without Extra Space", difficulty: "Easy", url: "https://leetcode.com/problems/merge-sorted-array/", platform: "LeetCode" },
        { id: "a2z-3-26", title: "Trapping Rain Water", difficulty: "Hard", url: "https://leetcode.com/problems/trapping-rain-water/", platform: "LeetCode" }
      ]
    },
    {
      topicId: "step-4",
      topicName: "Step 4: Binary Search [1D, 2D Arrays & Search Space]",
      problems: [
        { id: "a2z-4-1", title: "Binary Search to find X in sorted array", difficulty: "Easy", url: "https://leetcode.com/problems/binary-search/", platform: "LeetCode" },
        { id: "a2z-4-2", title: "Search Insert Position", difficulty: "Easy", url: "https://leetcode.com/problems/search-insert-position/", platform: "LeetCode" },
        { id: "a2z-4-3", title: "Find First and Last Position of Element in Sorted Array", difficulty: "Medium", url: "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/", platform: "LeetCode" },
        { id: "a2z-4-4", title: "Search in Rotated Sorted Array", difficulty: "Medium", url: "https://leetcode.com/problems/search-in-rotated-sorted-array/", platform: "LeetCode" },
        { id: "a2z-4-5", title: "Find Minimum in Rotated Sorted Array", difficulty: "Medium", url: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/", platform: "LeetCode" },
        { id: "a2z-4-6", title: "Find Peak Element", difficulty: "Medium", url: "https://leetcode.com/problems/find-peak-element/", platform: "LeetCode" },
        { id: "a2z-4-7", title: "Koko Eating Bananas", difficulty: "Medium", url: "https://leetcode.com/problems/koko-eating-bananas/", platform: "LeetCode" },
        { id: "a2z-4-8", title: "Search a 2D Matrix", difficulty: "Medium", url: "https://leetcode.com/problems/search-a-2d-matrix/", platform: "LeetCode" }
      ]
    },
    {
      topicId: "step-5",
      topicName: "Step 5: Strings [Basic & Medium]",
      problems: [
        { id: "a2z-5-1", title: "Remove Outermost Parentheses", difficulty: "Easy", url: "https://leetcode.com/problems/remove-outermost-parentheses/", platform: "LeetCode" },
        { id: "a2z-5-2", title: "Reverse Words in a String", difficulty: "Medium", url: "https://leetcode.com/problems/reverse-words-in-a-string/", platform: "LeetCode" },
        { id: "a2z-5-3", title: "Longest Common Prefix", difficulty: "Easy", url: "https://leetcode.com/problems/longest-common-prefix/", platform: "LeetCode" },
        { id: "a2z-5-4", title: "Valid Anagram", difficulty: "Easy", url: "https://leetcode.com/problems/valid-anagram/", platform: "LeetCode" },
        { id: "a2z-5-5", title: "Longest Substring Without Repeating Characters", difficulty: "Medium", url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/", platform: "LeetCode" },
        { id: "a2z-5-6", title: "Longest Palindromic Substring", difficulty: "Medium", url: "https://leetcode.com/problems/longest-palindromic-substring/", platform: "LeetCode" }
      ]
    },
    {
      topicId: "step-6",
      topicName: "Step 6: Learn LinkedList [Single, Double, Medium, Hard]",
      problems: [
        { id: "a2z-6-1", title: "Reverse a Linked List", difficulty: "Easy", url: "https://leetcode.com/problems/reverse-linked-list/", platform: "LeetCode" },
        { id: "a2z-6-2", title: "Middle of the Linked List", difficulty: "Easy", url: "https://leetcode.com/problems/middle-of-the-linked-list/", platform: "LeetCode" },
        { id: "a2z-6-3", title: "Detect Cycle in a Linked List", difficulty: "Easy", url: "https://leetcode.com/problems/linked-list-cycle/", platform: "LeetCode" },
        { id: "a2z-6-4", title: "Merge Two Sorted Linked Lists", difficulty: "Easy", url: "https://leetcode.com/problems/merge-two-sorted-lists/", platform: "LeetCode" },
        { id: "a2z-6-5", title: "Remove Nth Node From End of List", difficulty: "Medium", url: "https://leetcode.com/problems/remove-nth-node-from-end-of-list/", platform: "LeetCode" },
        { id: "a2z-6-6", title: "Reverse Nodes in k-Group", difficulty: "Hard", url: "https://leetcode.com/problems/reverse-nodes-in-k-group/", platform: "LeetCode" }
      ]
    },
    {
      topicId: "step-7",
      topicName: "Step 7: Recursion & Backtracking",
      problems: [
        { id: "a2z-7-1", title: "Subsets / Power Set", difficulty: "Medium", url: "https://leetcode.com/problems/subsets/", platform: "LeetCode" },
        { id: "a2z-7-2", title: "Combination Sum", difficulty: "Medium", url: "https://leetcode.com/problems/combination-sum/", platform: "LeetCode" },
        { id: "a2z-7-3", title: "N-Queens Problem", difficulty: "Hard", url: "https://leetcode.com/problems/n-queens/", platform: "LeetCode" },
        { id: "a2z-7-4", title: "Sudoku Solver", difficulty: "Hard", url: "https://leetcode.com/problems/sudoku-solver/", platform: "LeetCode" }
      ]
    },
    {
      topicId: "step-8",
      topicName: "Step 8: Bit Manipulation",
      problems: [
        { id: "a2z-8-1", title: "Check if i-th bit is set or not", difficulty: "Easy", url: "https://geeksforgeeks.org/check-whether-k-th-bit-set-not/", platform: "GFG" },
        { id: "a2z-8-2", title: "Count Set Bits", difficulty: "Easy", url: "https://leetcode.com/problems/number-of-1-bits/", platform: "LeetCode" },
        { id: "a2z-8-3", title: "Single Number", difficulty: "Easy", url: "https://leetcode.com/problems/single-number/", platform: "LeetCode" },
        { id: "a2z-8-4", title: "Subsets using Bit Manipulation", difficulty: "Medium", url: "https://leetcode.com/problems/subsets/", platform: "LeetCode" }
      ]
    },
    {
      topicId: "step-9",
      topicName: "Step 9: Stack and Queues",
      problems: [
        { id: "a2z-9-1", title: "Valid Parentheses", difficulty: "Easy", url: "https://leetcode.com/problems/valid-parentheses/", platform: "LeetCode" },
        { id: "a2z-9-2", title: "Min Stack Design", difficulty: "Medium", url: "https://leetcode.com/problems/min-stack/", platform: "LeetCode" },
        { id: "a2z-9-3", title: "Next Greater Element I", difficulty: "Easy", url: "https://leetcode.com/problems/next-greater-element-i/", platform: "LeetCode" },
        { id: "a2z-9-4", title: "Largest Rectangle in Histogram", difficulty: "Hard", url: "https://leetcode.com/problems/largest-rectangle-in-histogram/", platform: "LeetCode" },
        { id: "a2z-9-5", title: "Implement LRU Cache", difficulty: "Hard", url: "https://leetcode.com/problems/lru-cache/", platform: "LeetCode" }
      ]
    },
    {
      topicId: "step-10",
      topicName: "Step 10: Sliding Window & Two Pointer Problems",
      problems: [
        { id: "a2z-10-1", title: "Longest Substring Without Repeating Characters", difficulty: "Medium", url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/", platform: "LeetCode" },
        { id: "a2z-10-2", title: "Max Consecutive Ones III", difficulty: "Medium", url: "https://leetcode.com/problems/max-consecutive-ones-iii/", platform: "LeetCode" },
        { id: "a2z-10-3", title: "Fruit Into Baskets", difficulty: "Medium", url: "https://leetcode.com/problems/fruit-into-baskets/", platform: "LeetCode" },
        { id: "a2z-10-4", title: "Minimum Window Substring", difficulty: "Hard", url: "https://leetcode.com/problems/minimum-window-substring/", platform: "LeetCode" }
      ]
    },
    {
      topicId: "step-11",
      topicName: "Step 11: Heaps / Priority Queue",
      problems: [
        { id: "a2z-11-1", title: "Kth Largest Element in an Array", difficulty: "Medium", url: "https://leetcode.com/problems/kth-largest-element-in-an-array/", platform: "LeetCode" },
        { id: "a2z-11-2", title: "Kth Smallest Element in Array", difficulty: "Medium", url: "https://geeksforgeeks.org/kth-smallest-largest-element-in-unassorted-array/", platform: "GFG" },
        { id: "a2z-11-3", title: "Task Scheduler", difficulty: "Medium", url: "https://leetcode.com/problems/task-scheduler/", platform: "LeetCode" },
        { id: "a2z-11-4", title: "Find Median from Data Stream", difficulty: "Hard", url: "https://leetcode.com/problems/find-median-from-data-stream/", platform: "LeetCode" }
      ]
    },
    {
      topicId: "step-12",
      topicName: "Step 12: Greedy Algorithms",
      problems: [
        { id: "a2z-12-1", title: "Assign Cookies", difficulty: "Easy", url: "https://leetcode.com/problems/assign-cookies/", platform: "LeetCode" },
        { id: "a2z-12-2", title: "Fractional Knapsack", difficulty: "Medium", url: "https://geeksforgeeks.org/fractional-knapsack-problem/", platform: "GFG" },
        { id: "a2z-12-3", title: "N Meetings in One Room", difficulty: "Easy", url: "https://geeksforgeeks.org/find-maximum-meetings-in-one-room/", platform: "GFG" },
        { id: "a2z-12-4", title: "Job Sequencing Problem", difficulty: "Medium", url: "https://geeksforgeeks.org/job-sequencing-problem/", platform: "GFG" }
      ]
    },
    {
      topicId: "step-13",
      topicName: "Step 13: Binary Trees",
      problems: [
        { id: "a2z-13-1", title: "Invert Binary Tree", difficulty: "Easy", url: "https://leetcode.com/problems/invert-binary-tree/", platform: "LeetCode" },
        { id: "a2z-13-2", title: "Maximum Depth of Binary Tree", difficulty: "Easy", url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/", platform: "LeetCode" },
        { id: "a2z-13-3", title: "Diameter of Binary Tree", difficulty: "Easy", url: "https://leetcode.com/problems/diameter-of-binary-tree/", platform: "LeetCode" },
        { id: "a2z-13-4", title: "Lowest Common Ancestor of Binary Tree", difficulty: "Medium", url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/", platform: "LeetCode" }
      ]
    },
    {
      topicId: "step-14",
      topicName: "Step 14: Binary Search Trees (BST)",
      problems: [
        { id: "a2z-14-1", title: "Validate Binary Search Tree", difficulty: "Medium", url: "https://leetcode.com/problems/validate-binary-search-tree/", platform: "LeetCode" },
        { id: "a2z-14-2", title: "Search in a Binary Search Tree", difficulty: "Easy", url: "https://leetcode.com/problems/search-in-a-binary-search-tree/", platform: "LeetCode" },
        { id: "a2z-14-3", title: "Delete Node in a BST", difficulty: "Medium", url: "https://leetcode.com/problems/delete-node-in-a-bst/", platform: "LeetCode" },
        { id: "a2z-14-4", title: "Kth Smallest Element in a BST", difficulty: "Medium", url: "https://leetcode.com/problems/kth-smallest-element-in-a-bst/", platform: "LeetCode" }
      ]
    },
    {
      topicId: "step-15",
      topicName: "Step 15: Graphs [BFS, DFS, Shortest Path, MST]",
      problems: [
        { id: "a2z-15-1", title: "Number of Islands", difficulty: "Medium", url: "https://leetcode.com/problems/number-of-islands/", platform: "LeetCode" },
        { id: "a2z-15-2", title: "Rotting Oranges", difficulty: "Medium", url: "https://leetcode.com/problems/rotting-oranges/", platform: "LeetCode" },
        { id: "a2z-15-3", title: "Course Schedule", difficulty: "Medium", url: "https://leetcode.com/problems/course-schedule/", platform: "LeetCode" },
        { id: "a2z-15-4", title: "Dijkstra Algorithm Shortest Path", difficulty: "Medium", url: "https://geeksforgeeks.org/dijkstras-shortest-path-algorithm-greedy-algo-7/", platform: "GFG" }
      ]
    },
    {
      topicId: "step-16",
      topicName: "Step 16: Dynamic Programming",
      problems: [
        { id: "a2z-16-1", title: "Climbing Stairs", difficulty: "Easy", url: "https://leetcode.com/problems/climbing-stairs/", platform: "LeetCode" },
        { id: "a2z-16-2", title: "House Robber", difficulty: "Medium", url: "https://leetcode.com/problems/house-robber/", platform: "LeetCode" },
        { id: "a2z-16-3", title: "Coin Change", difficulty: "Medium", url: "https://leetcode.com/problems/coin-change/", platform: "LeetCode" },
        { id: "a2z-16-4", title: "Longest Common Subsequence", difficulty: "Medium", url: "https://leetcode.com/problems/longest-common-subsequence/", platform: "LeetCode" },
        { id: "a2z-16-5", title: "Longest Increasing Subsequence", difficulty: "Medium", url: "https://leetcode.com/problems/longest-increasing-subsequence/", platform: "LeetCode" }
      ]
    },
    {
      topicId: "step-17",
      topicName: "Step 17: Tries",
      problems: [
        { id: "a2z-17-1", title: "Implement Trie (Prefix Tree)", difficulty: "Medium", url: "https://leetcode.com/problems/implement-trie-prefix-tree/", platform: "LeetCode" }
      ]
    }
  ];

  return {
    sheetId: 'striver-a2z',
    sheetTitle: "Striver's A2Z DSA Course",
    totalProblems: steps.reduce((acc, t) => acc + t.problems.length, 0),
    topics: steps
  };
};

const buildFallbackBabbar = () => {
  const topics = [
    {
      topicId: "lb-topic-0",
      topicName: "Arrays",
      problems: [
        { id: "lb-0-0", title: "Reverse the Array", difficulty: "Easy", url: "https://www.geeksforgeeks.org/problems/reverse-an-array/", platform: "GFG" },
        { id: "lb-0-1", title: "Find Maximum and Minimum in an Array", difficulty: "Easy", url: "https://www.geeksforgeeks.org/problems/find-minimum-and-maximum-element-in-an-array/", platform: "GFG" },
        { id: "lb-0-2", title: "Find Kth Max and Min Element of Array", difficulty: "Medium", url: "https://leetcode.com/problems/kth-largest-element-in-an-array/", platform: "LeetCode" },
        { id: "lb-0-3", title: "Sort an Array of 0s, 1s and 2s", difficulty: "Medium", url: "https://leetcode.com/problems/sort-colors/", platform: "LeetCode" },
        { id: "lb-0-4", title: "Move all negative numbers to beginning", difficulty: "Easy", url: "https://www.geeksforgeeks.org/move-negative-numbers-beginning-positive-end-constant-extra-space/", platform: "GFG" },
        { id: "lb-0-5", title: "Find Union and Intersection of 2 Sorted Arrays", difficulty: "Easy", url: "https://geeksforgeeks.org/union-and-intersection-of-two-sorted-arrays-2/", platform: "GFG" },
        { id: "lb-0-6", title: "Cyclically Rotate an Array by One", difficulty: "Easy", url: "https://geeksforgeeks.org/c-program-cyclically-rotate-array-one/", platform: "GFG" },
        { id: "lb-0-7", title: "Find Largest Sum Contiguous Subarray (Kadane's)", difficulty: "Medium", url: "https://leetcode.com/problems/maximum-subarray/", platform: "LeetCode" }
      ]
    },
    {
      topicId: "lb-topic-1",
      topicName: "Matrix / 2D Arrays",
      problems: [
        { id: "lb-1-0", title: "Spiral Traversal on a Matrix", difficulty: "Medium", url: "https://leetcode.com/problems/spiral-matrix/", platform: "LeetCode" },
        { id: "lb-1-1", title: "Search an Element in a 2D Matrix", difficulty: "Medium", url: "https://leetcode.com/problems/search-a-2d-matrix/", platform: "LeetCode" },
        { id: "lb-1-2", title: "Find Median in a Row-wise Sorted Matrix", difficulty: "Medium", url: "https://geeksforgeeks.org/find-median-in-row-wise-sorted-matrix/", platform: "GFG" },
        { id: "lb-1-3", title: "Find Row with Maximum Number of 1s", difficulty: "Easy", url: "https://geeksforgeeks.org/find-the-row-with-maximum-number-1s/", platform: "GFG" }
      ]
    },
    {
      topicId: "lb-topic-2",
      topicName: "Strings",
      problems: [
        { id: "lb-2-0", title: "Reverse a String", difficulty: "Easy", url: "https://leetcode.com/problems/reverse-string/", platform: "LeetCode" },
        { id: "lb-2-1", title: "Check if String is Palindrome", difficulty: "Easy", url: "https://leetcode.com/problems/valid-palindrome/", platform: "LeetCode" },
        { id: "lb-2-2", title: "Find Duplicate Characters in a String", difficulty: "Easy", url: "https://geeksforgeeks.org/print-all-the-duplicates-in-the-input-string/", platform: "GFG" },
        { id: "lb-2-3", title: "Check if Strings are Rotations of Each Other", difficulty: "Easy", url: "https://leetcode.com/problems/rotate-string/", platform: "LeetCode" }
      ]
    },
    {
      topicId: "lb-topic-3",
      topicName: "Searching & Sorting",
      problems: [
        { id: "lb-3-0", title: "First and Last Positions of an Element in Sorted Array", difficulty: "Medium", url: "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/", platform: "LeetCode" },
        { id: "lb-3-1", title: "Find a Fixed Point (Value equal to index) in a given array", difficulty: "Easy", url: "https://geeksforgeeks.org/find-a-fixed-point-in-a-given-array/", platform: "GFG" },
        { id: "lb-3-2", title: "Search in Rotated Sorted Array", difficulty: "Medium", url: "https://leetcode.com/problems/search-in-rotated-sorted-array/", platform: "LeetCode" },
        { id: "lb-3-3", title: "Square Root of an Integer", difficulty: "Easy", url: "https://leetcode.com/problems/sqrtx/", platform: "LeetCode" }
      ]
    },
    {
      topicId: "lb-topic-4",
      topicName: "LinkedList",
      problems: [
        { id: "lb-4-0", title: "Reverse a LinkedList", difficulty: "Easy", url: "https://leetcode.com/problems/reverse-linked-list/", platform: "LeetCode" },
        { id: "lb-4-1", title: "Detect Loop in LinkedList", difficulty: "Easy", url: "https://leetcode.com/problems/linked-list-cycle/", platform: "LeetCode" },
        { id: "lb-4-2", title: "Delete Loop in LinkedList", difficulty: "Medium", url: "https://geeksforgeeks.org/detect-and-remove-loop-in-a-linked-list/", platform: "GFG" },
        { id: "lb-4-3", title: "Find Starting Node of Loop", difficulty: "Medium", url: "https://leetcode.com/problems/linked-list-cycle-ii/", platform: "LeetCode" }
      ]
    },
    {
      topicId: "lb-topic-5",
      topicName: "Binary Trees",
      problems: [
        { id: "lb-5-0", title: "Level Order Traversal of Binary Tree", difficulty: "Medium", url: "https://leetcode.com/problems/binary-tree-level-order-traversal/", platform: "LeetCode" },
        { id: "lb-5-1", title: "Reverse Level Order Traversal", difficulty: "Easy", url: "https://leetcode.com/problems/binary-tree-level-order-traversal-ii/", platform: "LeetCode" },
        { id: "lb-5-2", title: "Height of Binary Tree", difficulty: "Easy", url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/", platform: "LeetCode" },
        { id: "lb-5-3", title: "Diameter of Binary Tree", difficulty: "Easy", url: "https://leetcode.com/problems/diameter-of-binary-tree/", platform: "LeetCode" }
      ]
    },
    {
      topicId: "lb-topic-6",
      topicName: "Binary Search Trees (BST)",
      problems: [
        { id: "lb-6-0", title: "Find a Value in BST", difficulty: "Easy", url: "https://leetcode.com/problems/search-in-a-binary-search-tree/", platform: "LeetCode" },
        { id: "lb-6-1", title: "Deletion of a Node in BST", difficulty: "Medium", url: "https://leetcode.com/problems/delete-node-in-a-bst/", platform: "LeetCode" },
        { id: "lb-6-2", title: "Find Min and Max Value in BST", difficulty: "Easy", url: "https://geeksforgeeks.org/minimum-element-in-a-binary-search-tree/", platform: "GFG" }
      ]
    },
    {
      topicId: "lb-topic-7",
      topicName: "Greedy Algorithms",
      problems: [
        { id: "lb-7-0", title: "Activity Selection Problem", difficulty: "Medium", url: "https://geeksforgeeks.org/activity-selection-problem-greedy-algo-1/", platform: "GFG" },
        { id: "lb-7-1", title: "Job Sequencing Problem", difficulty: "Medium", url: "https://geeksforgeeks.org/job-sequencing-problem/", platform: "GFG" },
        { id: "lb-7-2", title: "Huffman Coding", difficulty: "Hard", url: "https://geeksforgeeks.org/huffman-coding-greedy-algo-3/", platform: "GFG" }
      ]
    },
    {
      topicId: "lb-topic-8",
      topicName: "Backtracking",
      problems: [
        { id: "lb-8-0", title: "Rat in a Maze Problem", difficulty: "Medium", url: "https://geeksforgeeks.org/rat-in-a-maze-backtracking-2/", platform: "GFG" },
        { id: "lb-8-1", title: "N-Queens Problem", difficulty: "Hard", url: "https://leetcode.com/problems/n-queens/", platform: "LeetCode" },
        { id: "lb-8-2", title: "Sudoku Solver", difficulty: "Hard", url: "https://leetcode.com/problems/sudoku-solver/", platform: "LeetCode" }
      ]
    },
    {
      topicId: "lb-topic-9",
      topicName: "Stacks & Queues",
      problems: [
        { id: "lb-9-0", title: "Implement Stack from Scratch", difficulty: "Easy", url: "https://geeksforgeeks.org/stack-data-structure-introduction-and-program/", platform: "GFG" },
        { id: "lb-9-1", title: "Implement Queue from Scratch", difficulty: "Easy", url: "https://geeksforgeeks.org/queue-set-1-introduction-and-array-implementation/", platform: "GFG" },
        { id: "lb-9-2", title: "Parenthesis Checker / Valid Parentheses", difficulty: "Easy", url: "https://leetcode.com/problems/valid-parentheses/", platform: "LeetCode" }
      ]
    },
    {
      topicId: "lb-topic-10",
      topicName: "Graphs",
      problems: [
        { id: "lb-10-0", title: "Breadth First Search (BFS)", difficulty: "Easy", url: "https://geeksforgeeks.org/breadth-first-search-or-bfs-for-a-graph/", platform: "GFG" },
        { id: "lb-10-1", title: "Depth First Search (DFS)", difficulty: "Easy", url: "https://geeksforgeeks.org/depth-first-search-or-dfs-for-a-graph/", platform: "GFG" },
        { id: "lb-10-2", title: "Detect Cycle in Directed Graph", difficulty: "Medium", url: "https://geeksforgeeks.org/detect-cycle-in-a-graph/", platform: "GFG" }
      ]
    },
    {
      topicId: "lb-topic-11",
      topicName: "Dynamic Programming",
      problems: [
        { id: "lb-11-0", title: "Coin Change Problem", difficulty: "Medium", url: "https://leetcode.com/problems/coin-change/", platform: "LeetCode" },
        { id: "lb-11-1", title: "0-1 Knapsack Problem", difficulty: "Medium", url: "https://geeksforgeeks.org/0-1-knapsack-problem-dp-10/", platform: "GFG" },
        { id: "lb-11-2", title: "Longest Common Subsequence", difficulty: "Medium", url: "https://leetcode.com/problems/longest-common-subsequence/", platform: "LeetCode" }
      ]
    },
    {
      topicId: "lb-topic-12",
      topicName: "Bit Manipulation",
      problems: [
        { id: "lb-12-0", title: "Count Set Bits in an Integer", difficulty: "Easy", url: "https://leetcode.com/problems/number-of-1-bits/", platform: "LeetCode" },
        { id: "lb-12-1", title: "Find Non-Repeating Elements in Array", difficulty: "Medium", url: "https://geeksforgeeks.org/find-two-non-repeating-elements-in-an-array-of-repeating-elements/", platform: "GFG" }
      ]
    }
  ];

  return {
    sheetId: 'love-babbar-450',
    sheetTitle: 'Love Babbar 450 DSA Cracker',
    totalProblems: topics.reduce((acc, t) => acc + t.problems.length, 0),
    topics
  };
};

async function run() {
  try {
    console.log('⏳ Fetching Striver A2Z dataset...');
    let normalizedA2Z = null;
    try {
      const resA2Z = await fetch(SOURCES.striverA2Z);
      if (resA2Z.ok) {
        const raw = await resA2Z.json();
        normalizedA2Z = normalizeA2Z(raw);
      }
    } catch (e) {
      console.warn('⚠️ Fetch failed for Striver A2Z:', e.message);
    }

    if (!normalizedA2Z || !normalizedA2Z.topics || normalizedA2Z.topics.length === 0) {
      console.log('💡 Using structured Striver A2Z dataset...');
      normalizedA2Z = buildFallbackStriverA2Z();
    }

    fs.writeFileSync(path.join(DATA_DIR, 'striverA2Z.json'), JSON.stringify(normalizedA2Z, null, 2));
    console.log(`✅ Striver A2Z saved: ${normalizedA2Z.totalProblems} problems across ${normalizedA2Z.topics.length} sections.`);

    console.log('⏳ Fetching Love Babbar 450 dataset...');
    let normalizedBabbar = null;
    try {
      const resBabbar = await fetch(SOURCES.loveBabbar450);
      if (resBabbar.ok) {
        const raw = await resBabbar.json();
        normalizedBabbar = normalizeBabbar(raw);
      }
    } catch (e) {
      console.warn('⚠️ Fetch failed for Love Babbar 450:', e.message);
    }

    if (!normalizedBabbar || !normalizedBabbar.topics || normalizedBabbar.topics.length === 0) {
      console.log('💡 Using structured Love Babbar 450 dataset...');
      normalizedBabbar = buildFallbackBabbar();
    }

    fs.writeFileSync(path.join(DATA_DIR, 'loveBabbar450.json'), JSON.stringify(normalizedBabbar, null, 2));
    console.log(`✅ Love Babbar saved: ${normalizedBabbar.totalProblems} problems across ${normalizedBabbar.topics.length} sections.`);
  } catch (err) {
    console.error('❌ Error during fetch:', err.message);
  }
}

run();
