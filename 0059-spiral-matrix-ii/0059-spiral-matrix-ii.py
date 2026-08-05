class Solution:
    def generateMatrix(self, n: int) -> List[List[int]]:
        matrix =[[0] * n for _ in range(n)]

        rowstart = 0
        rowend = n-1
        colstart = 0
        colend = n-1

        num = 1

        while rowstart<=rowend and colstart<=colend:

             #rowstart ,colstart->colend
            for i in range(colstart,colend+1):
                matrix[rowstart][i] = num
                num+=1
            rowstart+=1

            #colend , rowstart->rowend
            for i in range(rowstart,rowend+1):
                 matrix[i][colend] = num
                 num+=1
            colend-=1

            #rowend, colend->colstart
            for i in range(colend,colstart-1,-1):
                matrix[rowend][i] = num
                num+=1
            rowend-=1

            #colstart ,rowend->rowstart
            for i in range(rowend,rowstart-1,-1):
                matrix[i][colstart] = num
                num+=1
            colstart+=1

        return matrix      
                    




        
        