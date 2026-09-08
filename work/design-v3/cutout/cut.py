"""Cut the Kesim subject out of her studio backdrop.

Three things had to be true at once, and each was learned by getting it wrong.

A colour key alone deletes her face: her skin sits as close to the paper as a soft edge
does. The backdrop, though, is one region connected to the frame and she is not part of
it, so the key only proposes and a border flood fill decides.

The background it is compared against cannot be a straight interpolation between the
left and right margins. The seamless paper has a lit pool around her feet that no
left-to-right blend predicts, so that whole slab of floor came out as far from the model
as she is, and the cut-out carried a beige puddle around her shoes. The model here is
fitted in two dimensions instead: mask her out, average what is left over a coarse grid,
grow that average into the cells she covered, and smooth it back up to full size.

Finally the edge pixels are decontaminated — a partly transparent pixel is a mix of
subject and backdrop, so the backdrop's share is divided back out — which is what stops
a beige fringe when she is composited on a ground that is not this beige.
"""
from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter
import os, sys

GRID_W, GRID_H = 18, 26
NEAR, FAR = 17, 40


def background_model(src, subject):
    """A smooth 2D estimate of the paper, fitted where the subject is not."""
    W, H = src.size
    weight = subject.point(lambda v: 255 - v)
    num = [ImageChops.multiply(c, weight).resize((GRID_W, GRID_H), Image.BOX).getdata()
           for c in src.split()]
    den = weight.resize((GRID_W, GRID_H), Image.BOX).getdata()

    cells = []
    for i in range(GRID_W * GRID_H):
        w = den[i]
        cells.append(None if w < 24 else tuple(min(255, round(n[i] * 255 / w)) for n in num))

    # Grow the known cells into the ones she covers, so the estimate stays smooth across
    # her rather than jumping at her outline.
    for _ in range(GRID_W + GRID_H):
        if all(c is not None for c in cells):
            break
        nxt = list(cells)
        for y in range(GRID_H):
            for x in range(GRID_W):
                i = y * GRID_W + x
                if cells[i] is not None:
                    continue
                near = [cells[y2 * GRID_W + x2]
                        for x2, y2 in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1))
                        if 0 <= x2 < GRID_W and 0 <= y2 < GRID_H and cells[y2 * GRID_W + x2]]
                if near:
                    nxt[i] = tuple(round(sum(v[c] for v in near) / len(near)) for c in range(3))
        cells = nxt

    small = Image.new("RGB", (GRID_W, GRID_H))
    small.putdata([c or (0, 0, 0) for c in cells])
    return small.resize((W, H), Image.BICUBIC).filter(ImageFilter.GaussianBlur(12))


def matte(src, bg):
    W, H = src.size
    d = ImageChops.difference(src, bg).split()
    dist = ImageChops.lighter(ImageChops.lighter(d[0], d[1]), d[2])

    binary = dist.point(lambda v: 255 if v <= 30 else 0)
    seeds = [(2, 2), (W - 3, 2), (2, H - 3), (W - 3, H - 3)]
    seeds += [(x, 2) for x in range(20, W, 40)] + [(x, H - 3) for x in range(20, W, 40)]
    seeds += [(2, y) for y in range(20, H, 40)] + [(W - 3, y) for y in range(20, H, 40)]
    for sx, sy in seeds:
        if binary.getpixel((sx, sy)) == 255:
            ImageDraw.floodfill(binary, (sx, sy), 128, thresh=0)
    outside = binary.point(lambda v: 255 if v == 128 else 0)

    ramp = dist.point(lambda v: 0 if v <= NEAR else (255 if v >= FAR else int(255 * (v - NEAR) / (FAR - NEAR))))
    alpha = Image.composite(ramp, Image.new("L", (W, H), 255), outside)
    return alpha.filter(ImageFilter.GaussianBlur(0.7))


src = Image.open("gen/kesim-woman.png").convert("RGB")
src = ImageEnhance.Contrast(src).enhance(1.13)
src = ImageEnhance.Color(src).enhance(1.14)
src = ImageEnhance.Brightness(src).enhance(0.98)
W, H = src.size

# Pass one: a crude margin-interpolated model, only good enough to locate her.
band = 40
left = src.crop((0, 0, band, H)).resize((1, H), Image.BOX)
right = src.crop((W - band, 0, W, H)).resize((1, H), Image.BOX)
strip = Image.new("RGB", (2, H)); strip.paste(left, (0, 0)); strip.paste(right, (1, 0))
rough = matte(src, strip.resize((W, H), Image.BILINEAR))

# Pass two: fit the paper properly with her masked out, then key against that.
bg = background_model(src, rough.filter(ImageFilter.MaxFilter(21)))
alpha = matte(src, bg)

# Keep only the blob that is her, so no patch of paper the model still misreads floats
# beside her on a ground that is not this beige.
solid = alpha.point(lambda v: 255 if v >= 235 else 0)
cx, cy = W // 2, int(H * 0.55)
assert solid.getpixel((cx, cy)) == 255, "seed is not inside the subject"
ImageDraw.floodfill(solid, (cx, cy), 200, thresh=0)
keep = solid.point(lambda v: 255 if v == 200 else 0)
keep = keep.filter(ImageFilter.MaxFilter(7)).filter(ImageFilter.GaussianBlur(1.4))
alpha = ImageChops.multiply(alpha, keep)

inv = alpha.point(lambda v: 255 - v)
front = Image.merge("RGB", [
    ImageChops.subtract(c, ImageChops.multiply(b, inv)) for c, b in zip(src.split(), bg.split())
])
edge = alpha.point(lambda v: 255 if 8 < v < 248 else 0).filter(ImageFilter.GaussianBlur(0.6))
rgb = Image.composite(front, src, edge)

cut = Image.merge("RGBA", (*rgb.split(), alpha))
box = alpha.point(lambda v: 255 if v > 6 else 0).getbbox()
pad = 8
cut = cut.crop((max(0, box[0] - pad), max(0, box[1] - pad), min(W, box[2] + pad), min(H, box[3] + pad)))
cut = cut.resize((round(cut.width * 1500 / cut.height), 1500), Image.LANCZOS)
cut.save("kesim-cut.png")
print("cut", cut.size, os.path.getsize("kesim-cut.png") // 1024, "kb")

panels = []
for col in [(236, 214, 191), (0, 120, 200)]:
    full = Image.new("RGB", cut.size, col); full.paste(cut, (0, 0), cut)
    small = full.copy(); small.thumbnail((250, 740))
    feet = full.crop((0, cut.height - 330, cut.width, cut.height))
    panels += [small, feet]
proof = Image.new("RGB", (sum(p.width for p in panels) + 30, max(p.height for p in panels)), (30, 30, 30))
x = 0
for p in panels:
    proof.paste(p, (x, 0)); x += p.width + 10
proof.save("cut-proof.png"); print("proof", proof.size)
