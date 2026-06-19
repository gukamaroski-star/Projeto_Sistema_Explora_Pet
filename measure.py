from PIL import Image
img = Image.open(r'C:\Users\g.kamaroski\.gemini\antigravity-ide\brain\501492b0-39ea-4f8a-b3e5-4681d4cf6c04\media__1781880668130.png')
w, h = img.size
min_x, max_x = w, 0
min_y, max_y = h, 0
px = img.load()
for y in range(h):
    for x in range(w):
        if px[x,y][0]>240 and px[x,y][1]>240 and px[x,y][2]>240:
            if x < min_x: min_x = x
            if x > max_x: max_x = x
            if y < min_y: min_y = y
            if y > max_y: max_y = y
print(f'Box: {max_x-min_x}x{max_y-min_y}, Screen: {w}x{h}')
