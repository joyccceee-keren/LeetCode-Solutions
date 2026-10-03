class Solution:
    def numRescueBoats(self, people: list[int], limit: int) -> int:
        people.sort()
        ans = 0
        l,r = 0,len(people)-1
        while l<=r:
            remain = limit-people[r]
            r -= 1
            ans += 1
            if l <= r and remain >= people[l]:
                l += 1
        return ans        
       