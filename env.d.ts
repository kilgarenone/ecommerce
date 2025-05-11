declare namespace NodeJS {
    interface ProcessEnv {
        DATA_DIR: string;
        PORT: string;
        ORDERS_FILE_NAME: string;
        INVENTORY_FILE_NAME: string;
        INVENTORY_LOCKS_FILE_NAME: string;
    }
}
