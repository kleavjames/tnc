import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { SeriesService } from './series.service.js';

function service(prisma: object) {
  return new SeriesService(prisma as never);
}

describe('SeriesService', () => {
  it('lists series oldest first', async () => {
    const findMany = vi.fn().mockResolvedValue([
      { id: 's1', title: 'Emmanuel' },
    ]);
    const list = await service({ series: { findMany } }).list();

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: 'asc' } }),
    );
    expect(list).toEqual([{ id: 's1', title: 'Emmanuel' }]);
  });

  it('rejects a duplicate title without creating a row', async () => {
    const create = vi.fn();
    const findFirst = vi.fn().mockResolvedValue({ id: 's1' });
    await expect(
      service({ series: { findFirst, create } }).create({
        title: ' emmanuel ',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(create).not.toHaveBeenCalled();
  });

  it('creates a series with no cover', async () => {
    const create = vi.fn().mockResolvedValue({ id: 's2', title: 'Advent' });
    const created = await service({
      series: { findFirst: vi.fn().mockResolvedValue(null), create },
    }).create({ title: ' Advent ' });

    expect(create).toHaveBeenCalledWith({
      data: { title: 'Advent' },
      select: { id: true, title: true },
    });
    expect(created).toEqual({ id: 's2', title: 'Advent' });
  });

  it('returns not found when the series is already gone', async () => {
    const remove = service({
      series: {
        delete: vi.fn().mockRejectedValue({ code: 'P2025' }),
      },
    });
    await expect(remove.remove('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
