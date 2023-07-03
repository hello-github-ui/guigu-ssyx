import request from '@/utils/request'

const api_name = '/admin/product/attr'

export default {

    getList(groupId) {
        return request({
            url: `${api_name}/${groupId}`,
            method: 'get'
        })
    },
    getById(id) {
        return request({
            url: `${api_name}/get/${id}`,
            method: 'get'
        })
    },

    save(role) {
        return request({
            url: `${api_name}/save`,
            method: 'post',
            data: role
        })
    },

    updateById(role) {
        return request({
            url: `${api_name}/update`,
            method: 'put',
            data: role
        })
    },
    removeById(id) {
        return request({
            url: `${api_name}/remove/${id}`,
            method: 'delete'
        })
    },
    removeRows(idList) {
        return request({
            url: `${api_name}/batchRemove`,
            method: 'delete',
            data: idList
        })
    }
}
