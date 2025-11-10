import { Box } from "@mantine/core";

interface DirectoryTableCellProps {
    data: string
}

export const DirectoryTableCell : React.FC<DirectoryTableCellProps> = ({
    data,
}) => {
    return (
        <Box className="border border-gray-300 rounded-md px-3 py-2 text-center bg-white">
            {data}
        </Box>
    );
}