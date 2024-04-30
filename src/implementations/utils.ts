export class Utils {
    private constructor() { }

    public static generateId(existingIds: Array<string> = []): string {
        let id = String(Date.now())

        if (!existingIds.includes(id)) {
            return id;
        }

        let idx: number = 0;
        do {
            if (!existingIds.includes(id + "-" + idx)) {
                return id + "-" + idx;
            }
            idx++;
        } while (true);
    }
}